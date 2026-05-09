/*
 * ========================================
 * SMART FIRE MONITORING - TEMPERATURE FOCUS
 * ========================================
 * 
 * Firmware SIMPLIFIED - Fokus ke sensor suhu LM35 saja:
 * ✅ LM35 Temperature sensor (Accurate)
 * ✅ WiFi connection
 * ✅ Send data to dashboard (Real-time)
 * ✅ Professional Serial output
 * ✅ LED indicators with smart blinking
 * ✅ Calibration offset support
 * ✅ Temperature-based fire detection
 * ❌ Flame sensor DISABLED (fokus suhu dulu)
 * 
 * Hardware:
 * - ESP32 DevKit
 * - LM35DZ → GPIO35 (Temperature) - FIXED: Was GPIO 5 (not ADC!)
 * - LED Hijau → GPIO25 (NORMAL)
 * - LED Kuning → GPIO26 (WARNING)
 * - LED Merah → GPIO27 (DANGER)
 * 
 * WIRING SOLUTION (Breadboard Power Rails):
 * 1. ESP32 3.3V (right side, J-row) → Breadboard + Rail
 * 2. ESP32 GND (right side) → Breadboard - Rail
 * 3. LM35 Pin 1 (VCC) → + Rail
 * 4. LM35 Pin 2 (VOUT) → Breadboard D35 or E35
 * 5. LM35 Pin 3 (GND) → - Rail
 * 6. LED Hijau: GPIO25 → Anode (+) → Cathode (-) → 220Ω → - Rail
 * 7. LED Kuning: GPIO26 → Anode (+) → Cathode (-) → 220Ω → - Rail
 * 8. LED Merah: GPIO27 → Anode (+) → Cathode (-) → 220Ω → - Rail
 * 
 * Author: FireGuard AI Team
 * Version: 4.1 Temperature Focus Edition
 * Date: May 9, 2026
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ========================================
// WiFi CONFIGURATION
// ========================================
const char* WIFI_SSID = "Cibot";
const char* WIFI_PASSWORD = "Bible22.!";

// ========================================
// SERVER CONFIGURATION
// ========================================
const char* SERVER_URL = "http://10.161.255.205:3000/api/device/data";
const char* API_KEY = "fg_d7eb1408826e8078ea9e4555c9cc7a8a7ab4a33b8a94d89d";

// ========================================
// PIN DEFINITIONS
// ========================================
#define PIN_LM35        35  // LM35 Temperature Sensor (ADC1_CH7) - FIXED FROM GPIO 5!
#define PIN_LED_GREEN   25  // LED Hijau (NORMAL)
#define PIN_LED_YELLOW  26  // LED Kuning (WARNING)
#define PIN_LED_RED     27  // LED Merah (DANGER)

// FLAME SENSOR DISABLED (Fokus ke suhu saja)
// #define PIN_FLAME_DO    XX  // Not used
// #define PIN_FLAME_AO    XX  // Not used

// ========================================
// CALIBRATION SETTINGS
// ========================================
// UBAH NILAI INI SESUAI HASIL KALIBRASI:
#define LM35_CALIBRATION_OFFSET  0.0  // °C (dari lm35_calibration_tool)

// ========================================
// TEMPERATURE THRESHOLDS
// ========================================
#define TEMP_WARNING_THRESHOLD    40.0  // °C
#define TEMP_DANGER_THRESHOLD     55.0  // °C

// ========================================
// FLAME SENSOR THRESHOLDS (DISABLED - Not used)
// ========================================
// #define AO_BASELINE_NORMAL        3500
// #define AO_WARNING_THRESHOLD      2000
// #define AO_DANGER_THRESHOLD       1000
// #define AO_VALID_MINIMUM          100

// ========================================
// TIMING CONFIGURATION
// ========================================
#define LM35_SAMPLES              10    // Averaging samples
#define CONFIRMATION_COUNT        3     // Anti false positive
#define SEND_INTERVAL             5000  // Send data every 5 seconds (ms)
#define WIFI_RETRY_DELAY          5000  // Retry WiFi every 5 seconds

// ========================================
// LED BLINK INTERVALS
// ========================================
#define BLINK_NORMAL_ON     2000  // Green: ON 2s, OFF 1s (cycle 3s)
#define BLINK_NORMAL_OFF    1000
#define BLINK_WARNING_ON    1000  // Yellow: ON 1s, OFF 1s (cycle 2s)
#define BLINK_WARNING_OFF   1000
#define BLINK_DANGER_ON     500   // Red: ON 0.5s, OFF 0.5s (cycle 1s)
#define BLINK_DANGER_OFF    500

// ========================================
// SYSTEM STATUS
// ========================================
enum SystemStatus {
  STATUS_NORMAL,
  STATUS_WARNING,
  STATUS_DANGER
};

// ========================================
// GLOBAL VARIABLES
// ========================================

// System State
SystemStatus currentStatus = STATUS_NORMAL;
bool isWiFiConnected = false;

// Sensor Readings
float currentTemperature = 0.0;

// FLAME SENSOR DISABLED
// bool flameDO = false;
// int flameAO = 0;
// bool flameAOValid = true;

// Confirmation Counters (Anti False Positive)
int warningConfirmCount = 0;
int dangerConfirmCount = 0;

// LED State
unsigned long lastLEDToggle = 0;
bool ledState = false;

// Timing
unsigned long lastSendTime = 0;
unsigned long lastPrintTime = 0;
int sendSuccessCount = 0;
int sendFailCount = 0;

// WiFi
int wifiRSSI = 0;

// ========================================
// SETUP
// ========================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  printHeader();
  
  // Configure Pins
  // pinMode(PIN_FLAME_DO, INPUT);  // DISABLED - Flame sensor not used
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  
  // Turn off all LEDs
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("✅ System Ready!");
  Serial.println("========================================\n");
  
  delay(1000);
}

// ========================================
// MAIN LOOP
// ========================================
void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    isWiFiConnected = false;
    connectWiFi();
  } else {
    isWiFiConnected = true;
    wifiRSSI = WiFi.RSSI();
  }
  
  // Read temperature sensor
  currentTemperature = readTemperature();
  
  // FLAME SENSOR DISABLED - Fokus ke suhu saja
  // flameDO = readFlameDO();
  // flameAO = readFlameAO();
  // flameAOValid = (flameAO >= AO_VALID_MINIMUM);
  
  // Update system status with confirmation
  updateSystemStatus();
  
  // Update LEDs
  updateLEDs();
  
  // Print status every 1 second
  if (millis() - lastPrintTime >= 1000) {
    printSystemStatus();
    lastPrintTime = millis();
  }
  
  // Send data to server every 5 seconds
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    if (isWiFiConnected) {
      sendDataToServer();
    }
    lastSendTime = millis();
  }
  
  delay(100);
}

// ========================================
// CONNECT TO WiFi
// ========================================
void connectWiFi() {
  Serial.println("📶 Connecting to WiFi: " + String(WIFI_SSID));
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n📶 WiFi: ✅ Connected");
    Serial.print("🌐 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📡 Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    isWiFiConnected = true;
  } else {
    Serial.println("\n📶 WiFi: ❌ Failed to connect");
    Serial.println("⚠️  Will retry in 5 seconds...");
    isWiFiConnected = false;
  }
  
  Serial.println("========================================\n");
}

// ========================================
// READ TEMPERATURE (LM35) - WITH DEBUG
// ========================================
float readTemperature() {
  long sum = 0;
  int validReadings = 0;
  int rawADC = 0;
  float avgVoltage = 0.0;
  
  // Collect samples
  for (int i = 0; i < LM35_SAMPLES; i++) {
    int rawValue = analogRead(PIN_LM35);
    rawADC += rawValue;  // For debug
    float voltage = (rawValue * 3.3) / 4095.0;
    float temp = (voltage * 100.0) + LM35_CALIBRATION_OFFSET;
    
    // Validate reading
    if (temp >= -10.0 && temp <= 150.0) {  // Expanded range for debug
      sum += (int)(temp * 10);
      validReadings++;
    }
    
    delay(10);
  }
  
  // Calculate averages for debug
  rawADC = rawADC / LM35_SAMPLES;
  avgVoltage = (rawADC * 3.3) / 4095.0;
  
  // Print debug info every 5 seconds
  static unsigned long lastDebugPrint = 0;
  if (millis() - lastDebugPrint >= 5000) {
    Serial.println("\n🔍 LM35 DEBUG INFO:");
    Serial.print("   ADC Raw: ");
    Serial.print(rawADC);
    Serial.println(" / 4095");
    Serial.print("   Voltage: ");
    Serial.print(avgVoltage, 3);
    Serial.println(" V");
    Serial.print("   Valid Readings: ");
    Serial.print(validReadings);
    Serial.print(" / ");
    Serial.println(LM35_SAMPLES);
    
    if (rawADC == 0) {
      Serial.println("   ⚠️  ERROR: ADC = 0!");
      Serial.println("   → Check LM35 wiring:");
      Serial.println("      Pin 1 (VCC)  → ESP32 3.3V");
      Serial.println("      Pin 2 (VOUT) → ESP32 GPIO34");
      Serial.println("      Pin 3 (GND)  → ESP32 GND");
    } else if (rawADC > 4000) {
      Serial.println("   ⚠️  ERROR: ADC too high!");
      Serial.println("   → Check if VCC and GND are swapped");
    } else if (validReadings == 0) {
      Serial.println("   ⚠️  ERROR: No valid readings!");
      Serial.println("   → Temperature out of range");
    }
    
    lastDebugPrint = millis();
  }
  
  // Calculate average
  if (validReadings > 0) {
    return (sum / validReadings) / 10.0;
  } else {
    // Return 0.0 to indicate error (don't use fallback)
    return 0.0;
  }
}

// ========================================
// FLAME SENSOR FUNCTIONS (DISABLED)
// ========================================
// bool readFlameDO() {
//   int digitalValue = digitalRead(PIN_FLAME_DO);
//   return (digitalValue == LOW);
// }
// 
// int readFlameAO() {
//   int rawValue = analogRead(PIN_FLAME_AO);
//   return rawValue;
// }

// ========================================
// UPDATE SYSTEM STATUS (TEMPERATURE ONLY)
// ========================================
void updateSystemStatus() {
  // SIMPLIFIED: Only use temperature for fire detection
  
  // DANGER Condition
  if (currentTemperature >= TEMP_DANGER_THRESHOLD) {
    dangerConfirmCount++;
    warningConfirmCount = 0;
    if (dangerConfirmCount >= CONFIRMATION_COUNT) {
      currentStatus = STATUS_DANGER;
    } else {
      currentStatus = STATUS_WARNING;  // Confirming...
    }
  }
  // WARNING Condition
  else if (currentTemperature >= TEMP_WARNING_THRESHOLD) {
    warningConfirmCount++;
    dangerConfirmCount = 0;
    if (warningConfirmCount >= CONFIRMATION_COUNT) {
      currentStatus = STATUS_WARNING;
    } else {
      if (currentStatus != STATUS_WARNING) {
        currentStatus = STATUS_NORMAL;  // Confirming...
      }
    }
  }
  // NORMAL Condition
  else {
    currentStatus = STATUS_NORMAL;
    warningConfirmCount = 0;
    dangerConfirmCount = 0;
  }
}

// ========================================
// UPDATE LEDs
// ========================================
void updateLEDs() {
  unsigned long currentTime = millis();
  unsigned long onTime, offTime;
  
  // Determine blink interval based on status
  switch (currentStatus) {
    case STATUS_NORMAL:
      onTime = BLINK_NORMAL_ON;
      offTime = BLINK_NORMAL_OFF;
      break;
    case STATUS_WARNING:
      onTime = BLINK_WARNING_ON;
      offTime = BLINK_WARNING_OFF;
      break;
    case STATUS_DANGER:
      onTime = BLINK_DANGER_ON;
      offTime = BLINK_DANGER_OFF;
      break;
  }
  
  // Toggle LED based on timing
  unsigned long interval = ledState ? onTime : offTime;
  
  if (currentTime - lastLEDToggle >= interval) {
    ledState = !ledState;
    lastLEDToggle = currentTime;
    
    // Update LEDs
    digitalWrite(PIN_LED_GREEN, (currentStatus == STATUS_NORMAL && ledState) ? HIGH : LOW);
    digitalWrite(PIN_LED_YELLOW, (currentStatus == STATUS_WARNING && ledState) ? HIGH : LOW);
    digitalWrite(PIN_LED_RED, (currentStatus == STATUS_DANGER && ledState) ? HIGH : LOW);
  }
}

// ========================================
// SEND DATA TO SERVER
// ========================================
void sendDataToServer() {
  if (!isWiFiConnected) return;
  
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["temperature"] = currentTemperature;
  doc["humidity"] = 0;  // Not used
  doc["flameDetected"] = (currentStatus == STATUS_DANGER);
  doc["gasLevel"] = 0;  // Not used
  
  String payload;
  serializeJson(doc, payload);
  
  // Send POST request
  int httpCode = http.POST(payload);
  
  if (httpCode == 200) {
    sendSuccessCount++;
  } else {
    sendFailCount++;
  }
  
  http.end();
}

// ========================================
// PRINT SYSTEM STATUS (TEMPERATURE FOCUS)
// ========================================
void printSystemStatus() {
  Serial.println("========================================");
  
  // WiFi Status
  Serial.print("📶 WiFi: ");
  if (isWiFiConnected) {
    Serial.print("✅ Connected (");
    Serial.print(wifiRSSI);
    Serial.println(" dBm)");
  } else {
    Serial.println("❌ Disconnected");
  }
  
  // Temperature
  Serial.print("🌡️  Temperature: ");
  Serial.print(currentTemperature, 1);
  Serial.print("°C");
  
  if (currentTemperature == 0.0) {
    Serial.println(" [ERROR - LM35 NOT WORKING!]");
    Serial.println("⚠️  CRITICAL: LM35 sensor not reading!");
    Serial.println("   → Check wiring (see debug info above)");
  } else if (currentTemperature >= TEMP_DANGER_THRESHOLD) {
    Serial.println(" [DANGER]");
  } else if (currentTemperature >= TEMP_WARNING_THRESHOLD) {
    Serial.println(" [WARNING]");
  } else {
    Serial.println(" [NORMAL]");
  }
  
  // System Status
  Serial.print("🚦 Status: ");
  switch (currentStatus) {
    case STATUS_NORMAL:
      Serial.println("✅ NORMAL");
      break;
    case STATUS_WARNING:
      Serial.print("⚠️  WARNING");
      if (warningConfirmCount < CONFIRMATION_COUNT) {
        Serial.print(" (Confirming ");
        Serial.print(warningConfirmCount);
        Serial.print("/");
        Serial.print(CONFIRMATION_COUNT);
        Serial.print(")");
      }
      Serial.println();
      break;
    case STATUS_DANGER:
      Serial.print("🚨 DANGER!");
      if (dangerConfirmCount < CONFIRMATION_COUNT) {
        Serial.print(" (Confirming ");
        Serial.print(dangerConfirmCount);
        Serial.print("/");
        Serial.print(CONFIRMATION_COUNT);
        Serial.print(")");
      }
      Serial.println();
      break;
  }
  
  // LED Status
  Serial.print("💡 LED: ");
  switch (currentStatus) {
    case STATUS_NORMAL:
      Serial.println("GREEN BLINKING (ON 2s, OFF 1s)");
      break;
    case STATUS_WARNING:
      Serial.println("YELLOW BLINKING (ON 1s, OFF 1s)");
      break;
    case STATUS_DANGER:
      Serial.println("RED BLINKING (ON 0.5s, OFF 0.5s)");
      break;
  }
  
  // Statistics
  Serial.print("📈 Stats: Success=");
  Serial.print(sendSuccessCount);
  Serial.print(" | Fail=");
  Serial.println(sendFailCount);
  
  Serial.println();
}

// ========================================
// PRINT HEADER
// ========================================
void printHeader() {
  Serial.println("\n========================================");
  Serial.println("  SMART FIRE MONITORING - TEMP FOCUS");
  Serial.println("========================================");
  Serial.println("Version: 4.1 Temperature Focus Edition");
  Serial.println("Features:");
  Serial.println("  ✅ LM35 Temperature Sensor");
  Serial.println("  ✅ Temperature-based Detection");
  Serial.println("  ✅ WiFi + Dashboard");
  Serial.println("  ✅ Professional Output");
  Serial.println("  ✅ LED Indicators");
  Serial.println("  ✅ Calibration Support");
  Serial.println("  ❌ Flame Sensor (Disabled)");
  Serial.println("========================================\n");
}
