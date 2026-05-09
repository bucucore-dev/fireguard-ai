import { NextRequest, NextResponse } from "next/server";
import { chatWithOpenRouter, getSystemPrompt, type ChatMessage } from "@/lib/openrouter";
import { db } from "@/lib/db";

/**
 * POST /api/chat
 * Chat with AI assistant about FireGuardAI system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, includeContext = true } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Get system context if requested
    let context;
    if (includeContext) {
      try {
        // Fetch current system data with REAL sensor readings
        const [devices, alerts, stats, latestSensorData] = await Promise.all([
          // Get devices with location info
          db.device.findMany({
            select: {
              id: true,
              deviceId: true,
              deviceName: true,
              status: true,
              location: true,
              latitude: true,
              longitude: true,
              lastSeen: true,
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          }),
          
          // Get unresolved alerts
          db.alert.findMany({
            where: { resolved: false },
            select: {
              id: true,
              message: true,
              severity: true,
              createdAt: true,
              device: {
                select: {
                  deviceName: true,
                  location: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          }),
          
          // Get basic stats
          Promise.all([
            db.device.count(),
            db.device.count({ where: { status: "online" } }),
            db.alert.count({
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              },
            }),
          ]).then(([total, online, alertsToday]) => ({
            totalDevices: total,
            onlineDevices: online,
            offlineDevices: total - online,
            totalAlertsToday: alertsToday,
          })),
          
          // Get latest sensor data for each device
          db.device.findMany({
            select: {
              id: true,
              deviceId: true,
              deviceName: true,
              location: true,
              latitude: true,
              longitude: true,
              status: true,
              lastSeen: true,
              sensorLogs: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                  temperature: true,
                  humidity: true,
                  flameDetected: true,
                  gasLevel: true,
                  statusLevel: true,
                  createdAt: true,
                },
              },
            },
          }),
        ]);

        // Calculate average temperature from REAL sensor data
        const temperatures = latestSensorData
          .filter(d => d.sensorLogs.length > 0 && d.sensorLogs[0].temperature !== null)
          .map(d => d.sensorLogs[0].temperature);
        
        const avgTemp = temperatures.length > 0
          ? (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1)
          : "0";

        // Prepare enriched device data with sensor readings
        const devicesWithSensors = latestSensorData.map(device => {
          const latestLog = device.sensorLogs[0];
          const lastSeenTime = device.lastSeen 
            ? Math.floor((Date.now() - new Date(device.lastSeen).getTime()) / 1000)
            : null;
          
          return {
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            location: device.location,
            latitude: device.latitude,
            longitude: device.longitude,
            status: device.status,
            lastSeen: lastSeenTime ? `${lastSeenTime}s ago` : "Never",
            temperature: latestLog?.temperature ?? null,
            humidity: latestLog?.humidity ?? null,
            flameDetected: latestLog?.flameDetected ?? false,
            gasLevel: latestLog?.gasLevel ?? null,
            statusLevel: latestLog?.statusLevel ?? "normal",
            lastReading: latestLog?.createdAt ?? null,
          };
        });

        context = { 
          devices: devicesWithSensors, 
          alerts, 
          stats: {
            ...stats,
            currentAvgTemp: avgTemp,
          },
        };
      } catch (error) {
        console.error("Failed to fetch context:", error);
        // Continue without context
      }
    }

    // Prepare messages with system prompt
    const systemMessage: ChatMessage = {
      role: "system",
      content: getSystemPrompt(context),
    };

    const allMessages: ChatMessage[] = [systemMessage, ...messages];

    // Call OpenRouter API
    const response = await chatWithOpenRouter(allMessages);

    // Extract assistant's reply
    const assistantMessage = response.choices[0]?.message;

    if (!assistantMessage) {
      return NextResponse.json(
        { success: false, error: "No response from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    
    // Check if it's an OpenRouter API error
    if (error.message?.includes("OPENROUTER_API_KEY")) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process chat request",
      },
      { status: 500 }
    );
  }
}
