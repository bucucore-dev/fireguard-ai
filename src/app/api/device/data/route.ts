import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/device/data
 * Endpoint untuk menerima data dari ESP32 devices
 * Self-hosted single tenant - no user authentication needed
 *
 * Mendukung firmware v7.0+ (ISO/IEC 17025 format):
 * {
 *   temperature:         number,    // Suhu terkalibrasi dari LM35 (°C)
 *   flameDetected:       boolean,   // true jika api terdeteksi (DO || AO < 1500)
 *   gasLevel:            number,    // Nilai ADC MQ-2 (0=bersih, 4095=pekat)
 *   gasDetected:         boolean,   // true jika gas/asap terdeteksi
 *   humidity:            number,    // 0 (tidak ada sensor humidity)
 *   flameAO:             number,    // Raw ADC flame sensor
 *
 *   // ISO/IEC 17025 Traceability fields (firmware v7.0+):
 *   smokePercent:        number,    // % kepekatan asap (gasADC/4095*100), -1 = warm-up
 *   rackUnit:            string,    // Posisi rack "U01"-"U42"
 *   calibrationOffset:   number,    // Offset kalibrasi LM35 aktif (°C)
 *   firmwareVersion:     string,    // Versi firmware
 *   gasWarmUp:           boolean,   // Status warm-up MQ-2
 *   thresholdTempWarn:   number,    // Threshold warning suhu dikirim dari firmware
 *   thresholdTempDanger: number,    // Threshold danger suhu dikirim dari firmware
 *   thresholdGasWarn:    number,    // Threshold warning gas ADC
 *   thresholdGasDanger:  number,    // Threshold danger gas ADC
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support multiple field name formats for compatibility
    const temperature = typeof body.temperature === "number"
      ? Math.round(body.temperature * 10) / 10
      : body.temperature;
    const flameDetected = body.flameDetected ?? body.flame_detected ?? false;
    const gasDetected = body.gasDetected ?? body.gas_detected ?? false;
    const humidity = body.humidity ?? null;
    const gasLevel = body.gasLevel ?? body.gas_level ?? null;
    const timestamp = body.timestamp;

    // === ISO/IEC 17025 Traceability Fields (firmware v7.0+) ===
    const smokePercent = body.smokePercent ?? null;
    const rackUnit = body.rackUnit ?? null;
    const calibrationOffset = body.calibrationOffset ?? null;
    const firmwareVersion = body.firmwareVersion ?? null;
    const flameAO = body.flameAO ?? null;

    // Get API key from header (recommended) or body
    const apiKey = request.headers.get("X-API-Key") ||
      request.headers.get("x-api-key") ||
      body.api_key ||
      body.apiKey;

    if (!apiKey || temperature === undefined) {
      return NextResponse.json(
        { success: false, error: "API key and temperature are required" },
        { status: 400 }
      );
    }

    // Find device by API key
    const device = await db.device.findFirst({
      where: { apiKey: apiKey }
    });

    if (!device) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // ISO/IEC 17025 — Logika Status Level (Server-side evaluation)
    //
    // Threshold sesuai standar data center & prompt:
    //   Suhu Normal  : 18°C – 27°C  (ASHRAE A1 recommended inlet)
    //   Suhu Warning : > 27°C
    //   Suhu Danger  : ≥ 57°C       (Fixed Temperature detector)
    //
    //   Asap Warning : ADC ≥ 1200   (~0.03%/m obscuration)
    //   Asap Danger  : ADC ≥ 2500   (~0.06%/m obscuration)
    //
    //   Api + Suhu ≥ 57°C           = CRITICAL (pemadam otomatis)
    // ═══════════════════════════════════════════════════════════════
    let statusLevel: "normal" | "warning" | "danger" | "critical" = "normal";

    // Gunakan threshold dari firmware jika dikirim, jika tidak gunakan fallback setup box (40°C / 60°C)
    // agar sinkron dengan status indikator fisik (LED) pada device dan mencegah false warning/alarm.
    const TEMP_WARNING = body.thresholdTempWarn ?? 40.0;   // °C — batas atas normal
    const TEMP_DANGER = body.thresholdTempDanger ?? 60.0;   // °C — Fixed Temperature alarm pemadam
    const GAS_WARNING = body.thresholdGasWarn ?? 1200;   // ADC ~0.03%/m
    const GAS_DANGER = body.thresholdGasDanger ?? 2500;   // ADC ~0.06%/m

    const gasHigh = gasLevel !== null && gasLevel >= GAS_DANGER;
    const gasMedium = gasLevel !== null && gasLevel >= GAS_WARNING;

    // Evaluasi severity — prioritas dari kritis ke normal
    if ((flameDetected && gasDetected) || (flameDetected && temperature >= TEMP_DANGER)) {
      // Api + Gas bersamaan, atau api + suhu sangat tinggi (pemadam otomatis)
      statusLevel = "critical";
    } else if (gasHigh || temperature >= TEMP_DANGER) {
      // Gas pekat (>0.06%/m) atau suhu menyentuh/melebihi Fixed Temp detector
      statusLevel = "danger";
    } else if (flameDetected || gasDetected || gasMedium || temperature > TEMP_WARNING) {
      // Api terdeteksi, gas >0.03%/m, atau suhu melampaui batas normal (>27°C)
      statusLevel = "warning";
    }
    // else: statusLevel = "normal" (suhu 18-27°C, tidak ada api/gas)

    // Update device status and last seen
    await db.device.update({
      where: { id: device.id },
      data: {
        status: "online",
        lastSeen: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Create sensor log (dengan ISO 17025 traceability fields)
    await db.sensorLog.create({
      data: {
        deviceId: device.id,
        temperature,
        humidity,
        flameDetected,
        gasLevel,
        statusLevel: statusLevel === "critical" ? "danger" : statusLevel,
        createdAt: timestamp ? new Date(timestamp) : new Date(),
        // ISO/IEC 17025 fields
        smokePercent: smokePercent !== null && smokePercent >= 0 ? smokePercent : null,
        flameAO: flameAO,
        calibrationOffset: calibrationOffset,
        rackUnit: rackUnit,
        firmwareVersion: firmwareVersion,
      },
    });

    // ═══════════════════════════════════════════════════════════════
    // Audit Trail Alerts — hanya buat baru jika belum ada dalam 5 menit
    // Setiap alert menyimpan: sensorValue, thresholdValue,
    // calibrationOffset, rackUnit, sensorType (ISO 17025 audit trail)
    // ═══════════════════════════════════════════════════════════════
    if (statusLevel !== "normal") {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      // --- Fire alert ---
      if (flameDetected) {
        const severity = (statusLevel === "critical" || statusLevel === "danger") ? statusLevel : "warning";
        const message = severity === "critical"
          ? `🚨 CRITICAL: Api + Gas terdeteksi di ${device.deviceName}${rackUnit ? ` [${rackUnit}]` : ""}! Suhu: ${temperature.toFixed(1)}°C, Gas: ${gasLevel} ADC`
          : `🔥 Api terdeteksi di ${device.deviceName}${rackUnit ? ` [${rackUnit}]` : ""}! Suhu: ${temperature.toFixed(1)}°C`;

        const recentFireAlert = await db.alert.findFirst({
          where: {
            deviceId: device.id,
            alertType: "fire_detected",
            resolved: false,
            createdAt: { gte: fiveMinutesAgo },
          },
        });

        if (!recentFireAlert) {
          await db.alert.create({
            data: {
              deviceId: device.id,
              alertType: "fire_detected",
              message,
              severity,
              // ISO/IEC 17025 Audit Trail
              sensorValue: flameAO !== null ? flameAO : null,
              thresholdValue: 1500,   // FLAME_AO_WARNING_THRESHOLD
              calibrationOffset: calibrationOffset,
              rackUnit: rackUnit,
              sensorType: "flame",
            },
          });
        }
      }

      // --- Smoke/Gas alert ---
      if (gasDetected || gasMedium) {
        const gasSeverity = gasHigh ? "danger" : "warning";
        const smokeStr = smokePercent !== null && smokePercent >= 0
          ? ` (${smokePercent.toFixed(2)}%)`
          : "";
        const gasMessage = gasHigh
          ? `🚨 DANGER: Kepekatan asap tinggi di ${device.deviceName}${rackUnit ? ` [${rackUnit}]` : ""}! ADC: ${gasLevel}/4095${smokeStr}`
          : `💨 Asap/gas terdeteksi di ${device.deviceName}${rackUnit ? ` [${rackUnit}]` : ""}! ADC: ${gasLevel}/4095${smokeStr}`;

        const recentGasAlert = await db.alert.findFirst({
          where: {
            deviceId: device.id,
            alertType: "gas_leak",
            resolved: false,
            createdAt: { gte: fiveMinutesAgo },
          },
        });

        if (!recentGasAlert) {
          await db.alert.create({
            data: {
              deviceId: device.id,
              alertType: "gas_leak",
              message: gasMessage,
              severity: gasSeverity,
              // ISO/IEC 17025 Audit Trail
              sensorValue: gasLevel,
              thresholdValue: gasHigh ? GAS_DANGER : GAS_WARNING,
              calibrationOffset: null,  // Gas tidak menggunakan offset kalibrasi
              rackUnit: rackUnit,
              sensorType: "smoke",
            },
          });
        }
      }

      // --- Temperature-only alert (tanpa flame/gas) ---
      if (!flameDetected && !gasDetected && !gasMedium && temperature > TEMP_WARNING) {
        const tempSeverity = temperature >= TEMP_DANGER ? "danger" : "warning";
        const tempMessage = temperature >= TEMP_DANGER
          ? `🚨 DANGER: Suhu sangat tinggi di ${device.deviceName}${rackUnit ? ` [${rackUnit}]` : ""}: ${temperature.toFixed(1)}°C ≥ ${TEMP_DANGER}°C (alarm pemadam)`
          : `⚠️ WARNING: Suhu inlet melampaui batas normal di ${device.deviceName}${rackUnit ? ` [${rackUnit}]` : ""}: ${temperature.toFixed(1)}°C > ${TEMP_WARNING}°C`;

        const recentTempAlert = await db.alert.findFirst({
          where: {
            deviceId: device.id,
            alertType: "high_temperature",
            resolved: false,
            createdAt: { gte: fiveMinutesAgo },
          },
        });

        if (!recentTempAlert) {
          await db.alert.create({
            data: {
              deviceId: device.id,
              alertType: "high_temperature",
              message: tempMessage,
              severity: tempSeverity,
              // ISO/IEC 17025 Audit Trail
              sensorValue: temperature,
              thresholdValue: temperature >= TEMP_DANGER ? TEMP_DANGER : TEMP_WARNING,
              calibrationOffset: calibrationOffset,
              rackUnit: rackUnit,
              sensorType: "temperature",
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        statusLevel,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        temperature,
        flameDetected,
        gasDetected,
        gasLevel,
        smokePercent,
        rackUnit,
      },
      message: "Data received successfully",
    });
  } catch (error) {
    console.error("Error processing device data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process device data" },
      { status: 500 }
    );
  }
}
