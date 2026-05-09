import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "deviceId is required" },
        { status: 400 }
      );
    }

    const logs = await db.sensorLog.findMany({
      where: { deviceId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: { device: { select: { deviceName: true, deviceId: true } } },
    });

    const total = await db.sensorLog.count({ where: { deviceId } });

    return NextResponse.json({ success: true, data: { logs, total } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch sensor logs" }, { status: 500 });
  }
}
