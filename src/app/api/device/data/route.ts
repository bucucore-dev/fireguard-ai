import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/device/data
 * Endpoint untuk menerima data dari ESP32 devices
 * Self-hosted single tenant - no user authentication needed
 * 
 * Supports both formats:
 * - Header: X-API-Key (recommended)
 * - Body: api_key or apiKey
 * 
 * Payload dari firmware v6.0:
 * {
 *   temperature: number,     // Suhu dari LM35 (°C)
 *   flameDetected: boolean,  // true jika api terdeteksi (DO || AO < 1500)
 *   gasLevel: number,        // Nilai ADC MQ-2 (0=bersih, 4095=pekat)
 *   gasDetected: boolean,    // true jika gas/asap terdeteksi
 *   humidity: number,        // 0 (tidak ada sensor humidity)
 *   flameAO: number,        // Nilai ADC flame sensor (informatif)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support multiple field name formats for compatibility
    const temperature = body.temperature;
    const flameDetected = body.flameDetected ?? body.flame_detected ?? false;
    const gasDetected = body.gasDetected ?? body.gas_detected ?? false;
    const humidity = body.humidity ?? null;
    const gasLevel = body.gasLevel ?? body.gas_level ?? null;
    const timestamp = body.timestamp;
    
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

    // ═══════════════════════════════════════════
    // Calculate status level dari 3 sensor:
    //   1. LM35 Temperature
    //   2. MH Flame (flameDetected dari firmware)
    //   3. MQ-2 Gas (gasDetected + gasLevel dari firmware)
    //
    // Firmware sudah melakukan thresholding di sisi ESP32.
    // Backend melakukan evaluasi kedua untuk menentukan severity.
    // ═══════════════════════════════════════════
    let statusLevel: "normal" | "warning" | "danger" | "critical" = "normal";
    
    // Gas level thresholds (sesuai firmware)
    const gasHigh = gasLevel !== null && gasLevel >= 2500;  // Gas pekat
    const gasMedium = gasLevel !== null && gasLevel >= 1200; // Gas terdeteksi

    // Evaluasi severity — prioritas tertinggi di atas
    if ((flameDetected && gasDetected) || (flameDetected && temperature >= 55)) {
      // Api + gas bersamaan = sangat berbahaya, atau api + suhu sangat tinggi
      statusLevel = "critical";
    } else if (gasHigh || temperature >= 55) {
      // Gas pekat atau suhu sangat tinggi
      statusLevel = "danger";
    } else if (flameDetected || gasDetected || gasMedium || temperature >= 40) {
      // Api terdeteksi, gas terdeteksi, atau suhu tinggi
      statusLevel = "warning";
    }

    // Update device status and last seen
    await db.device.update({
      where: { id: device.id },
      data: {
        status: "online",
        lastSeen: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Create sensor log
    await db.sensorLog.create({
      data: {
        deviceId: device.id,
        temperature,
        humidity,
        flameDetected,
        gasLevel,
        statusLevel: statusLevel === "critical" ? "danger" : statusLevel,
        createdAt: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Create alert(s) if not normal
    if (statusLevel !== "normal") {
      const now = new Date();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      // --- Fire alert ---
      if (flameDetected) {
        const severity = (statusLevel === "critical" || statusLevel === "danger") ? statusLevel : "warning";
        const message = severity === "critical"
          ? `🚨 CRITICAL: Fire + Gas detected on ${device.deviceName}! Temp: ${temperature.toFixed(1)}°C, Gas: ${gasLevel}`
          : `🔥 Fire detected on ${device.deviceName}! Temperature: ${temperature.toFixed(1)}°C`;

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
            },
          });
        }
      }

      // --- Gas alert ---
      if (gasDetected || gasMedium) {
        const gasServerity = gasHigh ? "danger" : "warning";
        const gasMessage = gasHigh
          ? `🚨 DANGER: High gas/smoke level on ${device.deviceName}! Gas Level: ${gasLevel}/4095`
          : `💨 Gas/Smoke detected on ${device.deviceName}! Gas Level: ${gasLevel}/4095`;

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
              severity: gasServerity,
            },
          });
        }
      }

      // --- Temperature-only alert (tanpa flame/gas) ---
      if (!flameDetected && !gasDetected && !gasMedium && temperature >= 40) {
        const tempSeverity = temperature >= 55 ? "danger" : "warning";
        const tempMessage = temperature >= 55
          ? `🚨 DANGER: High temperature on ${device.deviceName}: ${temperature.toFixed(1)}°C`
          : `⚠️ WARNING: Temperature rising on ${device.deviceName}: ${temperature.toFixed(1)}°C`;

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
