import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const alert = await db.alert.update({
      where: { id },
      data: { resolved: true, resolvedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: alert });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to resolve alert" }, { status: 500 });
  }
}
