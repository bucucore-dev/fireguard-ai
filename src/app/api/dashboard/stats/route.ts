import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Threshold constants (Setup: Sensor di dalam box bersama ESP32)
// Disesuaikan agar sinkron dengan config.h pada firmware untuk menghindari false warning/alert.
const TEMP_WARNING  = 40.0;  // °C — batas atas normal di dalam box
const TEMP_DANGER   = 60.0;  // °C — batas bahaya di dalam box
const GAS_WARNING   = 1200;  // ADC ~0.03%/m obscuration
const GAS_DANGER    = 2500;  // ADC ~0.06%/m obscuration

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deviceId  = searchParams.get("deviceId");
    const timeRange = searchParams.get("timeRange") as "24h" | "7d" | "30d" | null ?? "24h";

    if (deviceId && deviceId !== "all") {
      return getDeviceSpecificStats(deviceId, timeRange);
    }
    return getAllDevicesStats(timeRange);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

function getTimeRangeStart(timeRange: "24h" | "7d" | "30d"): Date {
  const now = new Date();
  if (timeRange === "7d")  return new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  if (timeRange === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h default
}

/**
 * Group sensor logs by time bucket and compute avg temperature + avg smoke%.
 * Returns [{time, temperature, smokePercent?}]
 */
function buildTemperatureHistory(
  logs: { temperature: number; smokePercent: number | null; createdAt: Date }[],
  timeRange: "24h" | "7d" | "30d"
) {
  const bucketFn = (d: Date) =>
    timeRange === "24h"
      ? d.toISOString().slice(0, 13).replace("T", " ") // group by hour
      : d.toISOString().slice(0, 10);                   // group by day

  const byBucket = new Map<string, { temps: number[]; smoke: number[] }>();

  for (const log of logs) {
    const key = bucketFn(log.createdAt);
    if (!byBucket.has(key)) byBucket.set(key, { temps: [], smoke: [] });
    byBucket.get(key)!.temps.push(log.temperature);
    if (log.smokePercent !== null && log.smokePercent >= 0) {
      byBucket.get(key)!.smoke.push(log.smokePercent);
    }
  }

  const limit = timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30;

  return Array.from(byBucket.entries())
    .slice(-limit)
    .map(([time, { temps, smoke }]) => ({
      time: timeRange === "24h" ? time.slice(11) : time.slice(5), // "HH" or "MM-DD"
      temperature: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
      smokePercent: smoke.length > 0
        ? Math.round((smoke.reduce((a, b) => a + b, 0) / smoke.length) * 100) / 100
        : null,
    }));
}

/**
 * Build alert frequency grouped by day (last N days based on timeRange).
 */
function buildAlertFrequency(
  alerts: { createdAt: Date }[],
  timeRange: "24h" | "7d" | "30d"
) {
  const days = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 7;
  const now  = new Date();

  const alertsByDay = new Map<string, number>();
  for (const alert of alerts) {
    const day = alert.createdAt.toISOString().slice(0, 10);
    alertsByDay.set(day, (alertsByDay.get(day) || 0) + 1);
  }

  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d      = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = d.toISOString().slice(0, 10);
    result.push({
      date:  d.toLocaleDateString("en", { weekday: "short" }),
      count: alertsByDay.get(dayStr) || 0,
    });
  }
  return result;
}

// ─── Device-specific stats ───────────────────────────────────────────────────

async function getDeviceSpecificStats(deviceId: string, timeRange: "24h" | "7d" | "30d") {
  const device = await db.device.findUnique({ where: { id: deviceId } });
  if (!device) {
    return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });
  }

  const rangeStart = getTimeRangeStart(timeRange);

  const latestLog = await db.sensorLog.findFirst({
    where: { deviceId },
    orderBy: { createdAt: "desc" },
  });

  const currentAvgTemp      = latestLog?.temperature       ?? 0;
  const currentSmokePercent = latestLog?.smokePercent      ?? null;
  const flameDetectedCount  = latestLog?.flameDetected ? 1 : 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalAlertsToday, unresolvedAlertsCount, recentAlerts, unresolvedAlertsData] =
    await Promise.all([
      db.alert.count({ where: { deviceId, createdAt: { gte: todayStart } } }),
      db.alert.count({ where: { deviceId, resolved: false } }),
      db.alert.findMany({
        where: { deviceId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { device: { select: { deviceName: true, deviceId: true } } },
      }),
      db.alert.findMany({
        where: { deviceId, resolved: false },
        select: { severity: true },
      }),
    ]);

  let highestAlertSeverity = "info";
  const severities = unresolvedAlertsData.map((a) => a.severity);
  if (severities.includes("critical") || severities.includes("danger"))
    highestAlertSeverity = "danger";
  else if (severities.includes("warning")) highestAlertSeverity = "warning";

  const recentLogs = await db.sensorLog.findMany({
    where: { deviceId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { device: { select: { deviceName: true, deviceId: true } } },
  });

  // Temperature + Smoke history over selected time range
  const historyLogs = await db.sensorLog.findMany({
    where: { deviceId, createdAt: { gte: rangeStart } },
    orderBy: { createdAt: "asc" },
    select: { temperature: true, smokePercent: true, createdAt: true },
  });

  const temperatureHistory = buildTemperatureHistory(historyLogs, timeRange);

  // Alert frequency
  const sevenDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentAlertsAll = await db.alert.findMany({
    where: { deviceId, createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });
  const alertFrequency = buildAlertFrequency(recentAlertsAll, timeRange);

  const deviceActivity = [{
    deviceName: device.deviceName,
    count: await db.alert.count({ where: { deviceId } }),
  }];

  return NextResponse.json({
    success: true,
    data: {
      totalDevices:         1,
      onlineDevices:        device.status === "online" ? 1 : 0,
      offlineDevices:       device.status === "offline" ? 1 : 0,
      currentAvgTemp:       Math.round(currentAvgTemp * 10) / 10,
      currentSmokePercent,
      flameDetectedCount,
      totalAlertsToday,
      unresolvedAlerts:     unresolvedAlertsCount,
      highestAlertSeverity,
      // ISO/IEC 17025 threshold reference (untuk UI)
      isoThresholds: {
        tempNormal:  { min: 18, max: TEMP_WARNING },
        tempWarning: TEMP_WARNING,
        tempDanger:  TEMP_DANGER,
        gasWarning:  GAS_WARNING,
        gasDanger:   GAS_DANGER,
      },
      recentLogs,
      recentAlerts,
      temperatureHistory,
      alertFrequency,
      deviceActivity,
    },
  });
}

// ─── All-devices stats ───────────────────────────────────────────────────────

async function getAllDevicesStats(timeRange: "24h" | "7d" | "30d") {
  const devices     = await db.device.findMany();
  const totalDevices   = devices.length;
  const onlineDevices  = devices.filter((d) => d.status === "online").length;
  const offlineDevices = totalDevices - onlineDevices;
  const deviceIds      = devices.map((d) => d.id);

  let currentAvgTemp      = 0;
  let currentSmokePercent: number | null = null;
  let flameDetectedCount  = 0;

  if (deviceIds.length > 0) {
    const latestLogs = await Promise.all(
      deviceIds.map((did) =>
        db.sensorLog.findFirst({ where: { deviceId: did }, orderBy: { createdAt: "desc" } })
      )
    );

    const validLogs = latestLogs.filter(Boolean);
    if (validLogs.length > 0) {
      currentAvgTemp =
        validLogs.reduce((sum, log) => sum + (log?.temperature ?? 0), 0) / validLogs.length;

      const smokeLogs = validLogs.filter(
        (l) => l?.smokePercent !== null && (l?.smokePercent ?? -1) >= 0
      );
      if (smokeLogs.length > 0) {
        currentSmokePercent =
          smokeLogs.reduce((sum, l) => sum + (l?.smokePercent ?? 0), 0) / smokeLogs.length;
        currentSmokePercent = Math.round(currentSmokePercent * 100) / 100;
      }
    }
    flameDetectedCount = validLogs.filter((log) => log?.flameDetected === true).length;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalAlertsToday, unresolvedAlertsCount, recentAlerts, unresolvedAlertsData] =
    await Promise.all([
      db.alert.count({ where: { createdAt: { gte: todayStart } } }),
      db.alert.count({ where: { resolved: false } }),
      db.alert.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { device: { select: { deviceName: true, deviceId: true } } },
      }),
      db.alert.findMany({
        where: { resolved: false },
        select: { severity: true },
      }),
    ]);

  let highestAlertSeverity = "info";
  const severities = unresolvedAlertsData.map((a) => a.severity);
  if (severities.includes("critical") || severities.includes("danger"))
    highestAlertSeverity = "danger";
  else if (severities.includes("warning")) highestAlertSeverity = "warning";

  const recentLogs = await db.sensorLog.findMany({
    where: deviceIds.length > 0 ? { deviceId: { in: deviceIds } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { device: { select: { deviceName: true, deviceId: true } } },
  });

  const rangeStart = getTimeRangeStart(timeRange);

  const historyLogs = await db.sensorLog.findMany({
    where: {
      deviceId: { in: deviceIds },
      createdAt: { gte: rangeStart },
    },
    orderBy: { createdAt: "asc" },
    select: { temperature: true, smokePercent: true, createdAt: true },
  });

  const temperatureHistory = buildTemperatureHistory(historyLogs, timeRange);

  // Alert frequency (last 30 days max, filtered to timeRange for display)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentAlertsAll = await db.alert.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });
  const alertFrequency = buildAlertFrequency(recentAlertsAll, timeRange);

  const deviceAlerts = await db.alert.groupBy({
    by: ["deviceId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const deviceActivity = await Promise.all(
    deviceAlerts.map(async (da) => {
      const d = await db.device.findUnique({ where: { id: da.deviceId } });
      return { deviceName: d?.deviceName || "Unknown", count: da._count.id };
    })
  );

  return NextResponse.json({
    success: true,
    data: {
      totalDevices,
      onlineDevices,
      offlineDevices,
      currentAvgTemp:       Math.round(currentAvgTemp * 10) / 10,
      currentSmokePercent,
      flameDetectedCount,
      totalAlertsToday,
      unresolvedAlerts:     unresolvedAlertsCount,
      highestAlertSeverity,
      // ISO/IEC 17025 threshold reference (untuk UI)
      isoThresholds: {
        tempNormal:  { min: 18, max: TEMP_WARNING },
        tempWarning: TEMP_WARNING,
        tempDanger:  TEMP_DANGER,
        gasWarning:  GAS_WARNING,
        gasDanger:   GAS_DANGER,
      },
      recentLogs,
      recentAlerts,
      temperatureHistory,
      alertFrequency,
      deviceActivity,
    },
  });
}
