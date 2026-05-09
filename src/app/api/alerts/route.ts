import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const resolved = searchParams.get("resolved");
    const deviceId = searchParams.get("deviceId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};
    if (severity) where.severity = severity;
    if (resolved !== null && resolved !== undefined && resolved !== "") {
      where.resolved = resolved === "true";
    }
    if (deviceId) where.deviceId = deviceId;

    const alerts = await db.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: { device: { select: { deviceName: true, deviceId: true } } },
    });

    const total = await db.alert.count({ where });

    return NextResponse.json({ success: true, data: { alerts, total } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 });
  }
}
