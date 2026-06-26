import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/settings/bulk
 * Update multiple settings at once
 * Body: { settings: { key: value, key2: value2, ... } }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Invalid settings object" },
        { status: 400 }
      );
    }

    // Validate all keys
    const validKeys = [
      "tempWarningThreshold",
      "tempDangerThreshold",
      "emailNotifications",
      "telegramNotifications",
      "whatsappNotifications",
      "pushNotifications",
      "mqttEnabled",
      "websocketEnabled",
      "aiPredictionEnabled",
    ];

    const invalidKeys = Object.keys(settings).filter(
      (key) => !validKeys.includes(key)
    );

    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid setting keys: ${invalidKeys.join(", ")}` },
        { status: 400 }
      );
    }

    // Update each setting
    const updates = Object.entries(settings).map(([key, value]) =>
      db.systemSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          description: getSettingDescription(key),
        },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      updated: Object.keys(settings).length,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error bulk updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get setting descriptions
 */
function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    tempWarningThreshold: "Temperature threshold for warning alerts (°C)",
    tempDangerThreshold: "Temperature threshold for danger alerts (°C)",
    emailNotifications: "Enable email notification alerts",
    telegramNotifications: "Enable Telegram bot alerts",
    whatsappNotifications: "Enable WhatsApp alerts",
    pushNotifications: "Enable browser push notifications",
    mqttEnabled: "Enable MQTT protocol support",
    websocketEnabled: "Enable WebSocket live streaming",
    aiPredictionEnabled: "Enable AI-powered fire prediction",
  };

  return descriptions[key] || "System setting";
}
