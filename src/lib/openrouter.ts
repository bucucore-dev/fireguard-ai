/**
 * OpenRouter AI Client
 * Provides access to various free AI models
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Available free models on OpenRouter
 */
export const FREE_MODELS = {
  GEMINI_FLASH: "google/gemini-flash-1.5-8b",
  LLAMA_3_2: "meta-llama/llama-3.2-3b-instruct:free",
  QWEN_2: "qwen/qwen-2-7b-instruct:free",
  PHI_3: "microsoft/phi-3-mini-128k-instruct:free",
} as const;

/**
 * Chat with AI using OpenRouter
 */
export async function chatWithOpenRouter(
  messages: ChatMessage[],
  model?: string
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  // Use model from env or default to free model
  const selectedModel = model || process.env.OPENROUTER_MODEL || FREE_MODELS.GEMINI_FLASH;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "FireGuardAI",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Get system prompt for FireGuardAI Assistant
 */
export function getSystemPrompt(context?: {
  devices?: any[];
  alerts?: any[];
  stats?: any;
}): string {
  let prompt = `You are FireGuardAI Assistant, an AI helper for the FireGuardAI IoT fire monitoring system.

Your role:
- Help users understand their IoT devices and sensor data
- Explain alerts and provide recommendations
- Troubleshoot connection issues
- Analyze temperature trends and patterns
- Provide guidance on system usage
- Answer questions about specific devices or locations

IMPORTANT FORMATTING RULES:
- Use **bold** for important information (device names, status, values)
- Use bullet points (- ) for lists
- Use tables (| col | col |) for structured data
- Use numbered lists (1. 2. 3.) for steps
- Keep responses concise and well-organized
- Use emojis sparingly (✅ ❌ 🔥 ⚠️ 📊 🌡️ 📍)
- Break long responses into sections with headers (### Header)
- ALWAYS use REAL data from the system context provided below
- Show actual temperature readings, not dummy data
- Include location information when relevant

RESPONSE FORMAT EXAMPLES:

For device status (use REAL data):
### Device Status
| Device ID | Location | Status | Temperature | Last Seen |
|-----------|----------|--------|-------------|-----------|
| **IoTDevice-0x143000001** | Jakarta - Monas | ✅ Online | 27.3°C | 5s ago |

For location-based queries:
**Devices in Jakarta:**
- **IoTDevice-0x143000001** (Monas): 27.3°C ✅ Online
- Temperature: Normal range
- Last reading: 5 seconds ago

For temperature analysis:
🌡️ **Temperature Overview**
- Current: **27.3°C**
- Average: **26.8°C**
- Status: Normal ✅
- Location: Jakarta - Monas 📍

System Overview:
- FireGuardAI monitors temperature and flame detection from IoT devices (ESP32, Arduino, etc.)
- Devices send data via API with API Key authentication
- System shows real-time data on dashboard with maps
- Alerts are triggered for high temperature or flame detection`;

  if (context) {
    prompt += "\n\n### REAL-TIME SYSTEM DATA (Use this data in your responses)";
    
    if (context.stats) {
      prompt += `\n\n**System Overview:**`;
      prompt += `\n- Total Devices: **${context.stats.totalDevices}**`;
      prompt += `\n- Online Devices: **${context.stats.onlineDevices}** ✅`;
      if (context.stats.offlineDevices > 0) {
        prompt += `\n- Offline Devices: **${context.stats.offlineDevices}** ❌`;
      }
      prompt += `\n- Average Temperature: **${context.stats.currentAvgTemp}°C** 🌡️`;
      prompt += `\n- Alerts Today: **${context.stats.totalAlertsToday}** ${context.stats.totalAlertsToday > 0 ? '⚠️' : '✅'}`;
    }
    
    if (context.devices && context.devices.length > 0) {
      prompt += `\n\n**Registered Devices (REAL DATA):**`;
      context.devices.forEach((device: any) => {
        const statusIcon = device.status === 'online' ? '✅' : '❌';
        const tempDisplay = device.temperature !== null ? `${device.temperature}°C` : 'N/A';
        const locationDisplay = device.location || 'Unknown location';
        const coordsDisplay = device.latitude && device.longitude 
          ? `(${device.latitude}, ${device.longitude})` 
          : '';
        
        prompt += `\n\n**${device.deviceName}** (${device.deviceId})`;
        prompt += `\n- Status: ${statusIcon} ${device.status}`;
        prompt += `\n- Location: 📍 ${locationDisplay} ${coordsDisplay}`;
        prompt += `\n- Temperature: 🌡️ ${tempDisplay}`;
        if (device.humidity !== null) {
          prompt += `\n- Humidity: 💧 ${device.humidity}%`;
        }
        if (device.flameDetected) {
          prompt += `\n- Flame: 🔥 DETECTED!`;
        }
        prompt += `\n- Last Seen: ${device.lastSeen}`;
        prompt += `\n- Status Level: ${device.statusLevel}`;
      });
    }
    
    if (context.alerts && context.alerts.length > 0) {
      prompt += `\n\n**Recent Alerts:**`;
      context.alerts.slice(0, 5).forEach((alert: any) => {
        const severityIcon = alert.severity === 'critical' ? '🔥' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
        const deviceLocation = alert.device?.location ? ` (${alert.device.location})` : '';
        prompt += `\n- ${severityIcon} **${alert.severity.toUpperCase()}**: ${alert.message} - ${alert.device?.deviceName}${deviceLocation}`;
      });
    }
  }

  prompt += `\n\n**IMPORTANT INSTRUCTIONS:**
- When user asks about device status, show the REAL temperature from the data above
- When user asks about location, filter devices by location field
- When user asks "show me devices in [location]", list only devices matching that location
- Always use the actual sensor readings, not example data
- If temperature is null/N/A, mention that no recent reading is available
- Include location information (📍) when showing device data
- Show coordinates when relevant for mapping`;

  return prompt;
}

/**
 * Stream chat response (for real-time streaming)
 */
export async function streamChatWithOpenRouter(
  messages: ChatMessage[],
  model: string = FREE_MODELS.GEMINI_FLASH,
  onChunk: (chunk: string) => void
): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "FireGuardAI",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("No response body");
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}
