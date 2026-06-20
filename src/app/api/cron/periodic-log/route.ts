import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/cron/periodic-log
 * ===========================
 * Endpoint ini dipanggil oleh periodic-logger service setiap 10 menit.
 *
 * Fungsi:
 *   Untuk setiap device yang online (aktif dalam 15 menit terakhir),
 *   ambil sensor log terakhir dan buat snapshot baru dengan dataSource="cron".
 *
 *   Tujuan ISO/IEC 17025:
 *   - Membuktikan sistem monitoring aktif secara berkelanjutan
 *   - Saat export data, terlihat di menit mana saja kondisi "Normal"
 *   - Audit trail: ada rekaman explisit bahwa tidak ada anomali
 *
 * Auth: CRON_SECRET header (wajib, untuk mencegah panggilan tidak sah)
 */
export async function POST(request: NextRequest) {
  try {
    // Validasi CRON_SECRET
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      console.warn("[periodic-log] CRON_SECRET tidak diset di .env — endpoint terbuka!");
    } else if (cronSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    // Device dianggap aktif jika lastSeen dalam 15 menit terakhir
    const activeThreshold = new Date(now.getTime() - 15 * 60 * 1000);

    // Ambil semua device yang statusnya online dan aktif
    const activeDevices = await db.device.findMany({
      where: {
        status: "online",
        lastSeen: { gte: activeThreshold },
      },
    });

    if (activeDevices.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada device aktif — tidak ada log dibuat",
        logged: 0,
        skipped: 0,
        timestamp: now.toISOString(),
      });
    }

    let loggedCount = 0;
    let skippedCount = 0;
    const details: string[] = [];

    for (const device of activeDevices) {
      // Ambil sensor log terbaru dari device ini
      const latestLog = await db.sensorLog.findFirst({
        where: { deviceId: device.id },
        orderBy: { createdAt: "desc" },
      });

      if (!latestLog) {
        skippedCount++;
        details.push(`${device.deviceName}: skip (belum ada log)`);
        continue;
      }

      // Cek apakah statusLevel normal
      if (latestLog.statusLevel !== "normal") {
        skippedCount++;
        details.push(`${device.deviceName}: skip (status=${latestLog.statusLevel})`);
        continue;
      }

      // Cek apakah sudah ada cron log dalam 10 menit terakhir untuk device ini
      // (mencegah duplikasi jika service dipanggil 2x)
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const recentCronLog = await db.sensorLog.findFirst({
        where: {
          deviceId: device.id,
          dataSource: "cron",
          createdAt: { gte: tenMinutesAgo },
        },
      });

      if (recentCronLog) {
        skippedCount++;
        details.push(`${device.deviceName}: skip (sudah ada cron log dalam 10 menit)`);
        continue;
      }

      // Buat snapshot normal log
      await db.sensorLog.create({
        data: {
          deviceId:          device.id,
          temperature:       latestLog.temperature,
          humidity:          latestLog.humidity,
          flameDetected:     false, // Pasti false jika normal
          gasLevel:          latestLog.gasLevel,
          statusLevel:       "normal",
          createdAt:         now,
          // ISO/IEC 17025 traceability
          smokePercent:      latestLog.smokePercent,
          flameAO:           latestLog.flameAO,
          calibrationOffset: latestLog.calibrationOffset,
          rackUnit:          latestLog.rackUnit,
          firmwareVersion:   latestLog.firmwareVersion,
          // Penanda: ini adalah periodic normal snapshot, BUKAN data langsung dari ESP32
          dataSource:        "cron",
        },
      });

      loggedCount++;
      details.push(
        `${device.deviceName}${latestLog.rackUnit ? ` [${latestLog.rackUnit}]` : ""}: ` +
        `✅ Normal logged — T=${latestLog.temperature.toFixed(1)}°C, ` +
        `Smoke=${latestLog.smokePercent !== null ? latestLog.smokePercent!.toFixed(1) + "%" : "n/a"}`
      );
    }

    console.log(`[periodic-log] ${now.toISOString()} — logged=${loggedCount}, skipped=${skippedCount}`);
    details.forEach((d) => console.log(`  · ${d}`));

    return NextResponse.json({
      success: true,
      message: `Periodic normal log selesai`,
      logged: loggedCount,
      skipped: skippedCount,
      total_devices: activeDevices.length,
      timestamp: now.toISOString(),
      details,
    });
  } catch (error) {
    console.error("[periodic-log] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/periodic-log
 * Endpoint info — tampilkan status terbaru dari periodic log
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalToday, lastLog, deviceSummary] = await Promise.all([
      db.sensorLog.count({
        where: { dataSource: "cron", createdAt: { gte: oneDayAgo } },
      }),
      db.sensorLog.findFirst({
        where: { dataSource: "cron" },
        orderBy: { createdAt: "desc" },
        include: { device: { select: { deviceName: true } } },
      }),
      db.sensorLog.groupBy({
        by: ["deviceId"],
        where: { dataSource: "cron", createdAt: { gte: oneDayAgo } },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalNormalLogsToday: totalToday,
        lastPeriodicLog: lastLog
          ? {
              time: lastLog.createdAt,
              device: lastLog.device?.deviceName,
              temperature: lastLog.temperature,
              smokePercent: lastLog.smokePercent,
              rackUnit: lastLog.rackUnit,
            }
          : null,
        devicesLogged: deviceSummary.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
