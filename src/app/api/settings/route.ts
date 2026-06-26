import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/settings
 * Get all system settings
 */
export async function GET() {
  try {
    const settings = await db.systemSettings.findMany({
      orderBy: { key: "asc" },
    });

    // Convert to key-value object for easier access
    const settingsObj: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    // Return with defaults if settings don't exist
    const response = {
      tempWarningThreshold: settingsObj.tempWarningThreshold || "60",
      tempDangerThreshold: settingsObj.tempDangerThreshold || "80",
      emailNotifications: settingsObj.emailNotifications || "false",
      telegramNotifications: settingsObj.telegramNotifications || "false",
      whatsappNotifications: settingsObj.whatsappNotifications || "false",
      pushNotifications: settingsObj.pushNotifications || "true",
      mqttEnabled: settingsObj.mqttEnabled || "false",
      websocketEnabled: settingsObj.websocketEnabled || "false",
      aiPredictionEnabled: settingsObj.aiPredictionEnabled || "false",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update system settings
 * Body: { key: string, value: string }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Missing key or value" },
        { status: 400 }
      );
    }

    // Validate key
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

    if (!validKeys.includes(key)) {
      return NextResponse.json({ error: "Invalid setting key" }, { status: 400 });
    }

    // Validate threshold values
    if (key.includes("Threshold")) {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0 || numValue > 200) {
        return NextResponse.json(
          { error: "Threshold must be between 0 and 200" },
          { status: 400 }
        );
      }
    }

    // Upsert setting
    const setting = await db.systemSettings.upsert({
      where: { key },
      update: { value: String(value) },
      create: {
        key,
        value: String(value),
        description: getSettingDescription(key),
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

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

    return NextResponse.json({ success: true, updated: Object.keys(settings).length });
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
