/*
 * ========================================
 * SMART FIRE MONITORING - 3 SENSOR
 * ========================================
 * 
 * Firmware v6.0 - LM35 + MH Flame + MQ-2 Gas:
 * ✅ LM35 Temperature sensor (Accurate)
 * ✅ MH Flame Sensor - DO (Digital Output)
 * ✅ MH Flame Sensor - AO (Analog Output)
 * ✅ MQ-2 Gas Sensor - AO (Analog Output) — Smoke, LPG, CO
 * ✅ MQ-2 Gas Sensor - DO (Digital Output)
 * ✅ WiFi connection
 * ✅ Send data to dashboard (Real-time)
 * ✅ Calibration offset support
 * ✅ Temperature + Flame + Gas detection
 * ✅ LED Status Indicators (Green/Yellow/Red)
 * 
 * Hardware:
 * - ESP32 DevKit
 * - LM35DZ        → GPIO 35 (ADC1_CH7) - Temperature
 * - MH Flame DO   → GPIO 14 (Digital Input)
 * - MH Flame AO   → GPIO 34 (ADC1_CH6) - Analog Input (INPUT ONLY)
 * - MQ-2 Gas AO   → GPIO 32 (ADC1_CH4) - Analog Input
 * - MQ-2 Gas DO   → GPIO 27 (Digital Input)
 * 
 * ═══════════════════════════════════════════
 * WIRING 1: LM35 (Temperature Sensor)
 * ┌───────────────────────────────────────┐
 * │  LM35DZ — flat side menghadap ke atas │
 * │  Pin 1 (kiri)  : VCC  → ESP32 3.3V   │
 * │  Pin 2 (tengah): VOUT → ESP32 GPIO 35 │
 * │  Pin 3 (kanan) : GND  → ESP32 GND    │
 * └───────────────────────────────────────┘
 * 
 * WIRING 2: MH Flame Sensor (Api / Infrared)
 * ┌───────────────────────────────────────┐
 * │  MH Sensor (4 pin)                    │
 * │  VCC → ESP32 3.3V                     │
 * │  GND → ESP32 GND                      │
 * │  DO  → ESP32 GPIO 14 (Digital Input)  │
 * │  AO  → ESP32 GPIO 34 (Analog Input)   │
 * └───────────────────────────────────────┘
 * 
 * WIRING 3: MQ-2 Gas Sensor (Smoke, LPG, CO)
 * ┌───────────────────────────────────────────┐
 * │  MQ-2 Sensor (4 pin)                      │
 * │  VCC → ESP32 5V (VIN)  ⚠️ HARUS 5V!      │
 * │  GND → ESP32 GND                          │
 * │  AO  → ESP32 GPIO 32 (Analog Input)       │
 * │  DO  → ESP32 GPIO 21 (Digital Input)       │
 * └───────────────────────────────────────────┘
 * 
 * WIRING 4: LED Status Indicators
 * ┌───────────────────────────────────────────┐
 * │ CARA PASANG LED:                          │
 * │ - Kaki PANJANG = Positif (+) / Anoda      │
 * │ - Kaki PENDEK  = Negatif (-) / Katoda     │
 * │   (Ada sisi datar di plastik LED)         │
 * │                                           │
 * │ WIRING:                                   │
 * │  Green LED  : Pin 25 ➔ Resistor ➔ Kaki PANJANG │
 * │  Yellow LED : Pin 26 ➔ Resistor ➔ Kaki PANJANG │
 * │  Red LED    : Pin 27 ➔ Resistor ➔ Kaki PANJANG │
 * │                                           │
 * │ *Semua Kaki PENDEK gabung jadi satu ke GND ESP32 │
 * └───────────────────────────────────────────┘
 * 
 * CATATAN PENTING:
 * - GPIO 34 & 35 adalah INPUT ONLY, tidak bisa OUTPUT
 * - GPIO 32 bisa INPUT/OUTPUT, kita pakai sebagai INPUT analog
 * - MH Flame DO = LOW saat api terdeteksi (active low)
 * - MH Flame AO = nilai analog: makin rendah = api makin dekat/kuat
 * - MQ-2 membutuhkan 5V (bukan 3.3V!) → gunakan pin VIN pada ESP32
 * - MQ-2 DO = LOW saat gas terdeteksi melebihi ambang trimpot (active low)
 * - MQ-2 AO = nilai analog: makin TINGGI = gas makin banyak
 * - MQ-2 perlu PEMANASAN (warm-up) ~2-5 menit setelah dinyalakan
 *   pertama kali! Nilai AO tidak akurat sebelum warm-up selesai
 * - Putar trimpot di masing-masing sensor untuk atur sensitivitas DO
 * 
 * KALIBRASI MQ-2 TRIMPOT:
 *   1. Nyalakan ESP32, tunggu 3-5 menit (warm-up sensor)
 *   2. Pastikan tidak ada gas/asap di sekitar sensor
 *   3. Putar trimpot searah jarum jam (CW) sampai LED DO mati
 *   4. Putar balik sedikit berlawanan arah jarum jam (CCW)
 *      sampai LED DO hampir menyala tapi masih mati
 *   5. Coba tiup asap korek api → LED DO harus menyala
 *   6. Jika tidak menyala, putar CCW sedikit lagi
 * 
 * Author: FireGuard AI Team
 * Version: 6.0 Temperature + Flame + Gas Edition
 * Date: June 11, 2026
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ========================================
// WiFi CONFIGURATION
// ========================================
const char* WIFI_SSID     = "Cibot";
const char* WIFI_PASSWORD = "Bible22.!";

// ========================================
// SERVER CONFIGURATION
// ========================================
const char* SERVER_URL = "http://10.66.121.205:3000/api/device/data";
const char* API_KEY    = "fg_2440742faeca4cca2318921d9f295e8390e98793110f866a";

// ========================================
// PIN DEFINITIONS
// ========================================
// Sensor 1: LM35 Temperature
#define PIN_LM35       35  // LM35 Analog Out   (ADC1_CH7) — INPUT ONLY

// Sensor 2: MH Flame (Api)
#define PIN_FLAME_AO   34  // MH Flame Analog   (ADC1_CH6) — INPUT ONLY
#define PIN_FLAME_DO   14  // MH Flame Digital   — INPUT_PULLUP

// Sensor 3: MQ-2 Gas (Smoke, LPG, CO)
#define PIN_GAS_AO     32  // MQ-2 Gas Analog    (ADC1_CH4)
#define PIN_GAS_DO     21  // MQ-2 Gas Digital   — INPUT_PULLUP (Pindah dari 27 agar 27 dipakai LED Merah)

// Sensor 4: LEDs & Buzzer
#define PIN_LED_GREEN   25
#define PIN_LED_YELLOW  26
#define PIN_LED_RED     27
#define PIN_BUZZER      19  // Buzzer Active (Merah ke 19, Hitam ke GND)

// ========================================
// CALIBRATION SETTINGS
// ========================================
// ESP32 ADC tidak akurat di voltase rendah (0–0.3V)
// LM35 di suhu ruangan (22°C) output hanya 0.22V → ESP32 membaca terlalu rendah
// Offset +5.0°C mengkompensasi error ini
//
// CARA KALIBRASI:
//   1. Letakkan termometer di dekat LM35
//   2. Baca suhu di Serial Monitor dan bandingkan dengan termometer
//   3. Sesuaikan offset: jika termometer 22°C tapi ESP32 baca 17°C → offset = +5.0
#define LM35_CALIBRATION_OFFSET  5.0  // °C — kompensasi error ADC ESP32

// ========================================
// THRESHOLDS
// ========================================
// Temperature
#define TEMP_WARNING_THRESHOLD   40.0  // °C
#define TEMP_DANGER_THRESHOLD    55.0  // °C

// MH Flame AO — nilai ADC makin RENDAH = api makin kuat
// Range: 0 (api sangat dekat) sampai 4095 (tidak ada api)
//
// KALIBRASI (diukur langsung):
// - Ruangan tanpa cahaya apapun    : AO ~3800 – 4095
// - Cahaya lampu LED/pijar normal  : AO ~2000 – 3500
// - Korek api jarak 30–50 cm      : AO ~1200 – 1800
// - Korek api jarak 10–30 cm      : AO ~600  – 1200
// - Korek api jarak < 10 cm       : AO ~0    – 600
#define FLAME_AO_WARNING_THRESHOLD  1500  // ADC < 1500 = api terdeteksi (warning)
#define FLAME_AO_DANGER_THRESHOLD    700  // ADC < 700  = api sangat dekat (danger)

// MQ-2 Gas AO — nilai ADC makin TINGGI = gas makin banyak
// Range: 0 (udara bersih) sampai 4095 (gas sangat pekat)
//
// KALIBRASI (udara bersih vs gas):
// - Udara bersih normal            : AO ~200  – 800  (baseline setelah warm-up)
// - Asap ringan (korek api jauh)   : AO ~800  – 1500
// - Asap sedang (dekat sensor)     : AO ~1500 – 2500
// - Gas pekat (LPG/butane dekat)   : AO ~2500 – 4095
//
// ⚠️ CATATAN: Nilai baseline MQ-2 bisa berubah tergantung:
//    - Lama warm-up (2-5 menit pertama tidak akurat)
//    - Suhu dan kelembaban ruangan
//    - Umur sensor
//    Sesuaikan WARNING threshold jika sering false positive
#define GAS_WARNING_THRESHOLD   1200  // ADC > 1200 = gas/asap terdeteksi (warning)
#define GAS_DANGER_THRESHOLD    2500  // ADC > 2500 = gas pekat (danger)

// ========================================
// TIMING CONFIGURATION
// ========================================
#define LM35_SAMPLES        5    // Sample rata-rata LM35
#define FLAME_AO_SAMPLES    5    // Sample rata-rata Flame AO
#define GAS_AO_SAMPLES      5    // Sample rata-rata Gas AO
#define CONFIRMATION_COUNT  1    // Langsung respons
#define SEND_INTERVAL    5000    // Kirim data setiap 5 detik (ms)

// ========================================
// MQ-2 WARM-UP
// ========================================
#define GAS_WARMUP_TIME  180000  // 3 menit warm-up (ms)

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
SystemStatus currentStatus = STATUS_NORMAL;
bool isWiFiConnected = false;

float currentTemperature = 0.0;
int   currentFlameAO     = 4095;  // Default max (tidak ada api)
bool  currentFlameDO     = false; // false = tidak ada api
int   currentGasAO       = 0;    // Default min (udara bersih)
bool  currentGasDO       = false; // false = tidak ada gas

bool  gasWarmedUp        = false; // MQ-2 perlu warm-up
unsigned long startTime  = 0;

int warningConfirmCount = 0;
int dangerConfirmCount  = 0;

unsigned long lastSendTime  = 0;
unsigned long lastPrintTime = 0;
int sendSuccessCount = 0;
int sendFailCount    = 0;
int wifiRSSI = 0;

// ========================================
// SETUP
// ========================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  startTime = millis();

  printHeader();

  // MH Flame DO dengan PULL-UP internal
  pinMode(PIN_FLAME_DO, INPUT_PULLUP);

  // MQ-2 Gas DO dengan PULL-UP internal
  pinMode(PIN_GAS_DO, INPUT_PULLUP);

  // LEDs & Buzzer
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  
  // Matikan semua aktuator di awal
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  // GPIO 32: analog input (tidak perlu pinMode khusus untuk analogRead)
  // GPIO 34 & 35 INPUT ONLY — tidak perlu pinMode

  connectWiFi();

  Serial.println("✅ System Ready!");
  Serial.println("⏳ MQ-2 Gas sensor warming up (3 menit)...");
  Serial.println("========================================\n");
  delay(1000);
}

// ========================================
// MAIN LOOP
// ========================================
void loop() {
  // Cek WiFi
  if (WiFi.status() != WL_CONNECTED) {
    isWiFiConnected = false;
    connectWiFi();
  } else {
    isWiFiConnected = true;
    wifiRSSI = WiFi.RSSI();
  }

  // Cek warm-up MQ-2
  if (!gasWarmedUp && (millis() - startTime >= GAS_WARMUP_TIME)) {
    gasWarmedUp = true;
    Serial.println("\n✅ MQ-2 Gas sensor warm-up selesai! Pembacaan gas sekarang akurat.\n");
  }

  // Baca semua sensor
  currentTemperature = readTemperature();
  currentFlameAO     = readFlameAnalog();
  currentFlameDO     = readFlameDigital();
  currentGasAO       = readGasAnalog();
  currentGasDO       = readGasDigital();

  // Update status
  updateSystemStatus();

  // Update LEDs
  handleLEDs();

  // Print setiap 500ms
  if (millis() - lastPrintTime >= 500) {
    printSystemStatus();
    lastPrintTime = millis();
  }

  // Kirim ke server setiap 5 detik
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
    Serial.print("🌐 IP: "); Serial.println(WiFi.localIP());
    Serial.print("📡 Signal: "); Serial.print(WiFi.RSSI()); Serial.println(" dBm");
    isWiFiConnected = true;
  } else {
    Serial.println("\n📶 WiFi: ❌ Failed — retrying in 5s...");
    isWiFiConnected = false;
  }
  Serial.println("========================================\n");
}

// ========================================
// READ TEMPERATURE — LM35 (GPIO 35)
// ========================================
float readTemperature() {
  long sum = 0;
  int  validReadings = 0;
  int  rawADC = 0;

  for (int i = 0; i < LM35_SAMPLES; i++) {
    int rawValue = analogRead(PIN_LM35);
    rawADC += rawValue;
    float voltage = (rawValue * 3.3) / 4095.0;
    float temp    = (voltage * 100.0) + LM35_CALIBRATION_OFFSET;

    if (temp >= -10.0 && temp <= 150.0) {
      sum += (int)(temp * 10);
      validReadings++;
    }
    delay(10);
  }

  rawADC = rawADC / LM35_SAMPLES;

  // Debug setiap 10 detik
  static unsigned long lastDebug = 0;
  if (millis() - lastDebug >= 10000) {
    float avgVoltage = (rawADC * 3.3) / 4095.0;
    Serial.println("\n🔍 LM35 DEBUG:");
    Serial.print("   ADC Raw: ");    Serial.print(rawADC);        Serial.println(" / 4095");
    Serial.print("   Voltage: ");    Serial.print(avgVoltage, 3); Serial.println(" V");
    Serial.print("   Valid: ");      Serial.print(validReadings); Serial.print(" / "); Serial.println(LM35_SAMPLES);
    if (rawADC == 0) {
      Serial.println("   ⚠️  ADC=0! Cek wiring LM35:");
      Serial.println("      Pin 1 (VCC)  → 3.3V");
      Serial.println("      Pin 2 (VOUT) → GPIO 35");
      Serial.println("      Pin 3 (GND)  → GND");
    }
    lastDebug = millis();
  }

  return (validReadings > 0) ? (sum / validReadings) / 10.0 : 0.0;
}

// ========================================
// READ FLAME ANALOG — MH AO (GPIO 34)
// Nilai rendah = api makin dekat/kuat
// ========================================
int readFlameAnalog() {
  long sum = 0;
  for (int i = 0; i < FLAME_AO_SAMPLES; i++) {
    sum += analogRead(PIN_FLAME_AO);
    delay(5);
  }
  return sum / FLAME_AO_SAMPLES;
}

// ========================================
// READ FLAME DIGITAL — MH DO (GPIO 14)
// DO = LOW (0) saat api terdeteksi (active low)
// ========================================
bool readFlameDigital() {
  return (digitalRead(PIN_FLAME_DO) == LOW);
}

// ========================================
// READ GAS ANALOG — MQ-2 AO (GPIO 32)
// Nilai TINGGI = gas makin banyak
// (kebalikan dari flame sensor!)
// ========================================
int readGasAnalog() {
  long sum = 0;
  for (int i = 0; i < GAS_AO_SAMPLES; i++) {
    sum += analogRead(PIN_GAS_AO);
    delay(5);
  }
  return sum / GAS_AO_SAMPLES;
}

// ========================================
// READ GAS DIGITAL — MQ-2 DO (GPIO 27)
// DO = LOW saat gas melebihi ambang trimpot (active low)
// ========================================
bool readGasDigital() {
  return (digitalRead(PIN_GAS_DO) == LOW);
}

// ========================================
// UPDATE SYSTEM STATUS
// ========================================
void updateSystemStatus() {
  // --- Flame sensor ---
  bool flameDanger  = (currentFlameAO < FLAME_AO_DANGER_THRESHOLD);
  bool flameWarning = (currentFlameAO < FLAME_AO_WARNING_THRESHOLD);
  bool flameDO      = currentFlameDO;  // DO terkalibrasi via trimpot

  // --- Temperature ---
  bool tempDanger   = (currentTemperature >= TEMP_DANGER_THRESHOLD);
  bool tempWarning  = (currentTemperature >= TEMP_WARNING_THRESHOLD);

  // --- Gas sensor (hanya setelah warm-up) ---
  bool gasDanger    = gasWarmedUp && (currentGasAO >= GAS_DANGER_THRESHOLD);
  bool gasWarning   = gasWarmedUp && (currentGasAO >= GAS_WARNING_THRESHOLD);
  bool gasDO        = gasWarmedUp && currentGasDO;  // DO terkalibrasi via trimpot

  // DANGER: api dekat, gas pekat, atau suhu sangat tinggi
  if (flameDanger || (flameDO && flameDanger) || gasDanger || gasDO || tempDanger) {
    currentStatus = STATUS_DANGER;
    dangerConfirmCount++;
    warningConfirmCount = 0;
  }
  // WARNING: api terdeteksi, gas terdeteksi, atau suhu tinggi
  else if (flameDO || flameWarning || gasWarning || tempWarning) {
    currentStatus = STATUS_WARNING;
    warningConfirmCount++;
    dangerConfirmCount = 0;
  }
  // NORMAL
  else {
    currentStatus = STATUS_NORMAL;
    warningConfirmCount = 0;
    dangerConfirmCount  = 0;
  }
}

// ========================================
// HANDLE LEDs & BUZZER
// ========================================
void handleLEDs() {
  static unsigned long lastGreenToggle = 0;
  static bool greenState = false;
  
  static unsigned long lastBuzzerToggle = 0;
  static bool buzzerState = false;

  unsigned long currentMillis = millis();

  if (currentStatus == STATUS_DANGER) {
    // Merah menyala penuh, lainnya mati
    digitalWrite(PIN_LED_RED, HIGH);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_GREEN, LOW);
    
    // Buzzer menyala terus-menerus (Ngiiiiiing)
    digitalWrite(PIN_BUZZER, HIGH);
  } 
  else if (currentStatus == STATUS_WARNING) {
    // Kuning menyala penuh, lainnya mati
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_LED_YELLOW, HIGH);
    digitalWrite(PIN_LED_GREEN, LOW);
    
    // Buzzer bunyi terputus-putus cepat (Tit... Tit... Tit...)
    unsigned long elapsedBuzzer = currentMillis - lastBuzzerToggle;
    if (elapsedBuzzer >= 300) { // 300ms nyala, 300ms mati
      buzzerState = !buzzerState;
      digitalWrite(PIN_BUZZER, buzzerState ? HIGH : LOW);
      lastBuzzerToggle = currentMillis;
    }
  } 
  else {
    // Normal: Hijau menyala 5 detik, mati 2 detik
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_BUZZER, LOW); // Matikan buzzer
    
    unsigned long elapsed = currentMillis - lastGreenToggle;
    
    if (greenState && elapsed >= 5000) {
      // Sedang nyala, sudah 5 detik -> matikan
      greenState = false;
      lastGreenToggle = currentMillis;
      digitalWrite(PIN_LED_GREEN, LOW);
    } 
    else if (!greenState && elapsed >= 2000) {
      // Sedang mati, sudah 2 detik -> nyalakan
      greenState = true;
      lastGreenToggle = currentMillis;
      digitalWrite(PIN_LED_GREEN, HIGH);
    }
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

  // Flame detected: DO terkalibrasi ATAU AO di bawah warning
  bool flameDetected = currentFlameDO || (currentFlameAO < FLAME_AO_WARNING_THRESHOLD);

  // Gas detected: DO terkalibrasi ATAU AO di atas warning (setelah warm-up)
  bool gasDetected = gasWarmedUp && (currentGasDO || (currentGasAO >= GAS_WARNING_THRESHOLD));

  // Cetak peringatan saat bahaya terdeteksi
  if (flameDetected || gasDetected) {
    Serial.println();
    if (flameDetected) {
      Serial.println("🔥🔥🔥 ============================== 🔥🔥🔥");
      Serial.println("   !!! API TERDETEKSI — MENGIRIM ALERT !!!");
      Serial.print(  "   Flame DO : "); Serial.println(currentFlameDO ? "LOW (AKTIF)" : "HIGH (ok)");
      Serial.print(  "   Flame AO : "); Serial.print(currentFlameAO); Serial.println(" / 4095");
      Serial.println("🔥🔥🔥 ============================== 🔥🔥🔥");
    }
    if (gasDetected) {
      Serial.println("💨💨💨 ============================== 💨💨💨");
      Serial.println("   !!! GAS/ASAP TERDETEKSI — MENGIRIM ALERT !!!");
      Serial.print(  "   Gas DO : "); Serial.println(currentGasDO ? "LOW (AKTIF)" : "HIGH (ok)");
      Serial.print(  "   Gas AO : "); Serial.print(currentGasAO); Serial.println(" / 4095");
      Serial.println("💨💨💨 ============================== 💨💨💨");
    }
    Serial.println();
  }

  StaticJsonDocument<512> doc;
  doc["temperature"]   = currentTemperature;
  doc["flameDetected"] = flameDetected;
  doc["gasLevel"]      = currentGasAO;        // Nilai AO gas sensor (0=bersih, 4095=pekat)
  doc["gasDetected"]   = gasDetected;          // true jika gas/asap terdeteksi
  doc["humidity"]      = 0;                    // Tidak ada sensor humidity
  doc["flameAO"]       = currentFlameAO;       // Nilai AO flame sensor (informatif)

  String payload;
  serializeJson(doc, payload);
  Serial.print("📤 Payload: "); Serial.println(payload);

  int httpCode = http.POST(payload);

  if (httpCode == 200) {
    sendSuccessCount++;
    Serial.println("📤 Sent: ✅ OK (200)");
  } else {
    sendFailCount++;
    Serial.print("📤 Sent: ❌ HTTP "); Serial.println(httpCode);
  }

  http.end();
}

// ========================================
// PRINT SYSTEM STATUS
// ========================================
void printSystemStatus() {
  // Format compact: tampilkan semua sensor
  Serial.print("Flame AO=");
  Serial.print(currentFlameAO);
  Serial.print(" DO=");
  Serial.print(currentFlameDO ? "FIRE" : "ok");
  Serial.print(" | Gas AO=");
  Serial.print(currentGasAO);
  Serial.print(" DO=");
  Serial.print(currentGasDO ? "GAS!" : "ok");
  if (!gasWarmedUp) Serial.print("(warm)");
  Serial.print(" | T=");
  Serial.print(currentTemperature, 1);
  Serial.print("C | ");
  switch (currentStatus) {
    case STATUS_NORMAL:  Serial.println("NORMAL");    break;
    case STATUS_WARNING: Serial.println("WARNING !!"); break;
    case STATUS_DANGER:  Serial.println("DANGER !!!"); break;
  }
}

// ========================================
// PRINT HEADER
// ========================================
void printHeader() {
  Serial.println("\n========================================");
  Serial.println("  SMART FIRE MONITORING v6.0");
  Serial.println("  LM35 + MH Flame + MQ-2 Gas");
  Serial.println("========================================");
  Serial.println("Pins:");
  Serial.println("  LM35 VOUT   → GPIO 35 (Analog)");
  Serial.println("  MH Flame AO → GPIO 34 (Analog)");
  Serial.println("  MH Flame DO → GPIO 14 (Digital)");
  Serial.println("  MQ-2 Gas AO → GPIO 32 (Analog)");
  Serial.println("  MQ-2 Gas DO → GPIO 21 (Digital)");
  Serial.println("  LED Green   → GPIO 25");
  Serial.println("  LED Yellow  → GPIO 26");
  Serial.println("  LED Red     → GPIO 27");
  Serial.println("Features:");
  Serial.println("  ✅ LM35 Temperature Sensor");
  Serial.println("  ✅ MH Flame Sensor (DO + AO)");
  Serial.println("  ✅ MQ-2 Gas Sensor (DO + AO)");
  Serial.println("  ✅ WiFi + Dashboard");
  Serial.println("  ✅ Status LEDs");
  Serial.println("  ⏳ MQ-2 Warm-up: 3 menit");
  Serial.println("========================================\n");
}
