import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get("deviceId");

    // If specific device is selected
    if (deviceId && deviceId !== "all") {
      return getDeviceSpecificStats(deviceId);
    }

    // Otherwise, return all devices stats
    return getAllDevicesStats();
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
async function getDeviceSpecificStats(deviceId: string) {
  // Get device info
  const device = await db.device.findUnique({ where: { id: deviceId } });
  if (!device) {
    return NextResponse.json(
      { success: false, error: "Device not found" },
      { status: 404 }
    );
  }

  // Get latest sensor log for current reading
  const latestLog = await db.sensorLog.findFirst({
    where: { deviceId },
    orderBy: { createdAt: "desc" },
  });

  const currentAvgTemp = latestLog?.temperature ?? 0;
  const flameDetectedCount = latestLog?.flameDetected ? 1 : 0;

  // Alert stats for this device
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalAlertsToday, unresolvedAlerts, recentAlerts] = await Promise.all([
    db.alert.count({
      where: { deviceId, createdAt: { gte: todayStart } },
    }),
    db.alert.count({
      where: { deviceId, resolved: false },
    }),
    db.alert.findMany({
      where: { deviceId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { device: { select: { deviceName: true, deviceId: true } } },
    }),
  ]);

  // Recent sensor logs for this device
  const recentLogs = await db.sensorLog.findMany({
    where: { deviceId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { device: { select: { deviceName: true, deviceId: true } } },
  });

  // Temperature history - last 24 hours
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const hourlyLogs = await db.sensorLog.findMany({
    where: {
      deviceId,
      createdAt: { gte: yesterday },
    },
    orderBy: { createdAt: "asc" },
    select: { temperature: true, createdAt: true },
  });

  // Group by hour
  const tempByHour = new Map<string, number[]>();
  for (const log of hourlyLogs) {
    const hour = log.createdAt.toISOString().slice(0, 13).replace("T", " ");
    if (!tempByHour.has(hour)) tempByHour.set(hour, []);
    tempByHour.get(hour)!.push(log.temperature);
  }

  const temperatureHistory = Array.from(tempByHour.entries())
    .slice(-24)
    .map(([time, temps]) => ({
      time: time.slice(11),
      temperature: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
    }));

  // Alert frequency - last 7 days for this device
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentAlertsAll = await db.alert.findMany({
    where: { deviceId, createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  const alertsByDay = new Map<string, number>();
  for (const alert of recentAlertsAll) {
    const day = alert.createdAt.toISOString().slice(0, 10);
    alertsByDay.set(day, (alertsByDay.get(day) || 0) + 1);
  }

  const alertFrequency = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = d.toISOString().slice(0, 10);
    alertFrequency.push({
      date: d.toLocaleDateString("en", { weekday: "short" }),
      count: alertsByDay.get(dayStr) || 0,
    });
  }

  // Device activity (just this device)
  const deviceActivity = [{
    deviceName: device.deviceName,
    count: await db.alert.count({ where: { deviceId } }),
  }];

  return NextResponse.json({
    success: true,
    data: {
      totalDevices: 1,
      onlineDevices: device.status === "online" ? 1 : 0,
      offlineDevices: device.status === "offline" ? 1 : 0,
      currentAvgTemp: Math.round(currentAvgTemp * 10) / 10,
      flameDetectedCount,
      totalAlertsToday,
      unresolvedAlerts,
      recentLogs,
      recentAlerts,
      temperatureHistory,
      alertFrequency,
      deviceActivity,
    },
  });
}

async function getAllDevicesStats() {
  // Device stats
  const devices = await db.device.findMany();
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === "online").length;
  const offlineDevices = totalDevices - onlineDevices;

  // Get latest sensor log per device for average temp
  const deviceIds = devices.map((d) => d.id);
  let currentAvgTemp = 0;
  let flameDetectedCount = 0;

  if (deviceIds.length > 0) {
    const latestLogs = await Promise.all(
      deviceIds.map(async (did) => {
        return db.sensorLog.findFirst({
          where: { deviceId: did },
          orderBy: { createdAt: "desc" },
        });
      })
    );

    const validLogs = latestLogs.filter(Boolean);
    if (validLogs.length > 0) {
      currentAvgTemp =
        validLogs.reduce((sum, log) => sum + (log?.temperature ?? 0), 0) / validLogs.length;
    }
    flameDetectedCount = validLogs.filter((log) => log?.flameDetected === true).length;
  }

  // Alert stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalAlertsToday, unresolvedAlerts, recentAlerts] = await Promise.all([
    db.alert.count({
      where: { createdAt: { gte: todayStart } },
    }),
    db.alert.count({
      where: { resolved: false },
    }),
    db.alert.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { device: { select: { deviceName: true, deviceId: true } } },
    }),
  ]);

  // Recent sensor logs
  const recentLogs = await db.sensorLog.findMany({
    where: deviceIds.length > 0 ? { deviceId: { in: deviceIds } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { device: { select: { deviceName: true, deviceId: true } } },
  });

  // Temperature history - last 24 hours grouped by hour
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const hourlyLogs = await db.sensorLog.findMany({
    where: {
      deviceId: { in: deviceIds },
      createdAt: { gte: yesterday },
    },
    orderBy: { createdAt: "asc" },
    select: { temperature: true, createdAt: true },
  });

  // Group by hour
  const tempByHour = new Map<string, number[]>();
  for (const log of hourlyLogs) {
    const hour = log.createdAt.toISOString().slice(0, 13).replace("T", " ");
    if (!tempByHour.has(hour)) tempByHour.set(hour, []);
    tempByHour.get(hour)!.push(log.temperature);
  }

  const temperatureHistory = Array.from(tempByHour.entries())
    .slice(-24)
    .map(([time, temps]) => ({
      time: time.slice(11),
      temperature: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
    }));

  // Alert frequency - last 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentAlertsAll = await db.alert.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  const alertsByDay = new Map<string, number>();
  for (const alert of recentAlertsAll) {
    const day = alert.createdAt.toISOString().slice(0, 10);
    alertsByDay.set(day, (alertsByDay.get(day) || 0) + 1);
  }

  const alertFrequency = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = d.toISOString().slice(0, 10);
    alertFrequency.push({
      date: d.toLocaleDateString("en", { weekday: "short" }),
      count: alertsByDay.get(dayStr) || 0,
    });
  }

  // Device activity - alert count per device
  const deviceAlerts = await db.alert.groupBy({
    by: ["deviceId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const deviceActivity = await Promise.all(
    deviceAlerts.map(async (da) => {
      const device = await db.device.findUnique({ where: { id: da.deviceId } });
      return {
        deviceName: device?.deviceName || "Unknown",
        count: da._count.id,
      };
    })
  );

  return NextResponse.json({
    success: true,
    data: {
      totalDevices,
      onlineDevices,
      offlineDevices,
      currentAvgTemp: Math.round(currentAvgTemp * 10) / 10,
      flameDetectedCount,
      totalAlertsToday,
      unresolvedAlerts,
      recentLogs,
      recentAlerts,
      temperatureHistory,
      alertFrequency,
      deviceActivity,
    },
  });
}
