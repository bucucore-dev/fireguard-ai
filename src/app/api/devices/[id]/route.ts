import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const device = await db.device.findUnique({
      where: { id },
      include: { _count: { select: { sensorLogs: true, alerts: true } } },
    });

    if (!device) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });
    }

    const recentLogs = await db.sensorLog.findMany({
      where: { deviceId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const recentAlerts = await db.alert.findMany({
      where: { deviceId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ success: true, data: { device, recentLogs, recentAlerts } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch device" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const device = await db.device.update({
      where: { id },
      data: {
        ...(body.deviceName && { deviceName: body.deviceName }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json({ success: true, data: device });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update device" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.device.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Device deleted successfully" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete device" }, { status: 500 });
  }
}
