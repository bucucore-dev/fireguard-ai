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
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support multiple field name formats for compatibility
    const temperature = body.temperature;
    const flameDetected = body.flameDetected ?? body.flame_detected ?? false;
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

    // Calculate status level based on temperature and flame
    let statusLevel: "normal" | "warning" | "danger" | "critical" = "normal";
    
    if (flameDetected) {
      statusLevel = "critical";  // Fire detected = critical
    } else if (temperature >= 55) {
      statusLevel = "danger";    // Temp > 55°C = danger
    } else if (temperature >= 40) {
      statusLevel = "warning";   // Temp 40-55°C = warning
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
        statusLevel: statusLevel === "critical" ? "danger" : statusLevel,  // Map critical to danger for DB
        createdAt: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Create alert if not normal
    if (statusLevel !== "normal") {
      const alertType = flameDetected ? "fire_detected" : "high_temperature";
      
      let message = "";
      if (flameDetected) {
        message = `🔥 Fire detected on ${device.deviceName}! Temperature: ${temperature.toFixed(1)}°C`;
      } else if (statusLevel === "danger") {
        message = `🚨 DANGER: High temperature on ${device.deviceName}: ${temperature.toFixed(1)}°C`;
      } else {
        message = `⚠️ WARNING: Temperature rising on ${device.deviceName}: ${temperature.toFixed(1)}°C`;
      }

      // Check if similar alert exists in last 5 minutes (avoid spam)
      const recentAlert = await db.alert.findFirst({
        where: {
          deviceId: device.id,
          alertType,
          resolved: false,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      });

      // Only create new alert if no recent similar alert
      if (!recentAlert) {
        await db.alert.create({
          data: {
            deviceId: device.id,
            alertType,
            message,
            severity: statusLevel === "critical" ? "critical" : statusLevel,
          },
        });
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
