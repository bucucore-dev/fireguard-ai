import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateApiKey } from "@/lib/auth";

/**
 * GET /api/devices
 * Fetch all devices in this deployment
 * Self-hosted single tenant - returns all devices
 * Auto-marks devices as offline if lastSeen > 30 seconds ago
 */
export async function GET() {
  try {
    const OFFLINE_THRESHOLD_MS = 30 * 1000; // 30 seconds
    const offlineCutoff = new Date(Date.now() - OFFLINE_THRESHOLD_MS);

    // Mark stale devices as offline in bulk before fetching
    await db.device.updateMany({
      where: {
        status: "online",
        lastSeen: { lt: offlineCutoff },
      },
      data: { status: "offline" },
    });

    const devices = await db.device.findMany({
      include: { _count: { select: { sensorLogs: true, alerts: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: devices });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch devices" }, { status: 500 });
  }
}

/**
 * POST /api/devices
 * Register a new device
 * Self-hosted single tenant - no userId needed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceName, deviceId, location, latitude, longitude } = body;

    if (!deviceName || !deviceId) {
      return NextResponse.json(
        { success: false, error: "deviceName and deviceId are required" },
        { status: 400 }
      );
    }

    const existing = await db.device.findUnique({ where: { deviceId } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Device ID already exists" },
        { status: 409 }
      );
    }

    const apiKey = generateApiKey();
    const device = await db.device.create({
      data: { 
        deviceId, 
        deviceName, 
        location, 
        latitude: latitude || null,
        longitude: longitude || null,
        apiKey, 
        status: "offline" 
      },
    });

    return NextResponse.json({ success: true, data: device }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create device" }, { status: 500 });
  }
}
