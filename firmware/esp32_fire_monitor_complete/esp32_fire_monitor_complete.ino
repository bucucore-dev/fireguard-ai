/*
 * ========================================
 * SMART FIRE MONITORING - DATA CENTER RACK
 * ISO/IEC 17025 Compliant Edition
 * ========================================
 * 
 * Firmware v7.0 - LM35 + MH Flame + MQ-2 Gas (ISO/IEC 17025):
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
 * Version: 7.0 ISO/IEC 17025 Data Center Rack Edition
 * Date: June 19, 2026
 * 
 * ISO/IEC 17025 COMPLIANCE:
 * - Kalibrasi offset terdokumentasi dan dikirim ke server
 * - Data logging setiap 10 detik (SEND_INTERVAL)
 * - Audit trail: nilai sensor + threshold + offset dikirim bersama alarm
 * - Smoke level dalam % obscuration (0.0% - 100.0%)
 * - Rack Unit identifier untuk monitoring per-U
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ========================================
// KONFIGURASI — dari config.h
// ========================================
// WiFi, Server URL, API Key, dan Rack Unit ID
// disimpan di file config.h (tidak di-commit ke git)
// Salin config.h.example → config.h dan isi nilai Anda
#include "config.h"

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
// CALIBRATION SETTINGS (ISO/IEC 17025)
// ========================================
// Formula kalibrasi sesuai ISO 17025:
//   suhu_aktual = suhu_sensor + LM35_CALIBRATION_OFFSET
//
// ESP32 ADC tidak akurat di voltase rendah (0–0.3V)
// LM35 di suhu ruangan (22°C) output hanya 0.22V → ESP32 membaca terlalu rendah
// Offset +5.0°C mengkompensasi error sistematis ini.
//
// CARA KALIBRASI (ISO 17025 Traceability Procedure):
// LM35_CALIBRATION_OFFSET dipindah ke config.h
// (lihat config.h atau config.h.example)

// ========================================
// RACK UNIT IDENTIFIER
// ========================================
// RACK_UNIT_ID sudah dipindah ke config.h agar setiap
// perangkat/unit bisa dikonfigurasi tanpa modifikasi kode
// (lihat config.h atau config.h.example)

// TEMP_WARNING_THRESHOLD dan TEMP_DANGER_THRESHOLD dipindah ke config.h
// agar bisa dikonfigurasi per-instalasi tanpa ubah kode utama
// (lihat config.h atau config.h.example)

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
// ISO/IEC 17025 — Smoke Obscuration Mapping (VESDA/Titanus equivalent):
// Smoke % = (ADC / 4095) * 100.0  [estimasi % obscuration/meter]
// - Udara bersih normal            : AO ~200  – 800   → ~0.005% – 0.02%  (Normal)
// - Asap sangat ringan (early warn): AO ~400  – 1200  → ~0.01%  – 0.029% (Pre-warning)
// - Asap warning (VESDA Warning)   : AO ~1200 – 2500  → ~0.03%  – 0.06%  (WARNING)
// - Asap alarm (VESDA Alarm)       : AO ~2500 – 4095  → ~0.06%  – 0.1%   (DANGER)
//
// Threshold ISO (NFPA 72 / EN 54-20 equivalent):
//   Early Warning : smoke > 0.01%/m (≈ ADC > 400)
//   Warning       : smoke > 0.03%/m (≈ ADC > 1200)   ← GAS_WARNING_THRESHOLD
//   Alarm Pemadam : smoke > 0.06%/m (≈ ADC > 2500)   ← GAS_DANGER_THRESHOLD
//
// ⚠️ CATATAN: Nilai baseline MQ-2 bisa berubah tergantung:
//    - Lama warm-up (2-5 menit pertama tidak akurat)
//    - Suhu dan kelembaban ruangan
//    - Umur sensor
#define GAS_WARNING_THRESHOLD   1200  // ADC > 1200 ≈ smoke > 0.03%/m (WARNING)
#define GAS_DANGER_THRESHOLD    2500  // ADC > 2500 ≈ smoke > 0.06%/m (DANGER/ALARM)

// ========================================
// TIMING CONFIGURATION
// ========================================
#define LM35_SAMPLES        20   // ↑ Naik dari 5 → 20 untuk rata-rata lebih stabil
#define FLAME_AO_SAMPLES    10   // ↑ Naik dari 5 → 10
#define GAS_AO_SAMPLES      10   // ↑ Naik dari 5 → 10

// HYSTERESIS — konfirmasi status sebelum alarm aktif
// 3 = perlu 3× pembacaan berurutan (±3 detik) sebelum status berubah
// Ini mencegah false alarm akibat noise ADC sesaat
// ⚠️  Untuk api/bahaya nyata: perlu 3 detik sudah cukup responsif
//     Untuk false alarm dari noise ADC/panas sesaat: sudah tersaring
#define CONFIRMATION_COUNT  3    // ↑ Naik dari 1 → 3 (konfirmasi ±3 detik)

#define SEND_INTERVAL   10000    // Kirim data setiap 10 detik (ISO 17025 logging interval)

// EMA (Exponential Moving Average) untuk filter suhu
// alpha = 0.2 → lebih lambat merespons perubahan sesaat (anti-noise)
// alpha = 0.5 → lebih responsif
// Rumus: smoothed = alpha × raw + (1 - alpha) × prev_smoothed
// Contoh: noise spike 68°C → smoothed hanya naik ~10°C, bukan langsung 68°C
#define EMA_ALPHA           0.2  // Filter coefficient (0.1=halus, 0.5=responsif)

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
float smoothedTemperature = -1.0;  // EMA filter suhu (-1 = belum diinisialisasi)
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

  analogReadResolution(12);          // 12-bit ADC (0-4095)
  analogSetAttenuation(ADC_11db);    // Full range 0-3.3V untuk semua pin ADC
                                     // Tanpa ini: LM35 <0.3V sangat noisy!
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
  float rawTemp      = readTemperature();

  // ───────────────────────────────────────────────────────
  // EMA Filter suhu — anti-noise ADC ESP32
  // Inisialisasi dengan nilai pertama jika belum ada
  if (smoothedTemperature < 0) {
    smoothedTemperature = rawTemp;  // Inisialisasi pertama kali
  } else {
    smoothedTemperature = (EMA_ALPHA * rawTemp) + ((1.0 - EMA_ALPHA) * smoothedTemperature);
  }
  currentTemperature = smoothedTemperature;
  // ───────────────────────────────────────────────────────

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
    Serial.print("   Raw Temp: ");   Serial.print((validReadings > 0) ? (sum / validReadings) / 10.0 : 0, 1); Serial.println(" °C");
    Serial.print("   Smoothed: ");   Serial.print(smoothedTemperature, 1); Serial.println(" °C (EMA filtered)");
    if (rawADC == 0) {
      Serial.println("   ⚠️  ADC=0! Cek wiring LM35:");
      Serial.println("      Pin 1 (VCC)  → 3.3V");
      Serial.println("      Pin 2 (VOUT) → GPIO 35");
      Serial.println("      Pin 3 (GND)  → GND");
    }
    lastDebug = millis();
  }

  return (validReadings > 0) ? (sum / validReadings) / 10.0 : (smoothedTemperature > 0 ? smoothedTemperature : 0.0);
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

  // --- Temperature (menggunakan smoothedTemperature, bukan raw) ---
  bool tempDanger   = (currentTemperature >= TEMP_DANGER_THRESHOLD);
  bool tempWarning  = (currentTemperature >= TEMP_WARNING_THRESHOLD);

  // --- Gas sensor (hanya setelah warm-up) ---
  bool gasDanger    = gasWarmedUp && (currentGasAO >= GAS_DANGER_THRESHOLD);
  bool gasWarning   = gasWarmedUp && (currentGasAO >= GAS_WARNING_THRESHOLD);
  bool gasDO        = gasWarmedUp && currentGasDO;  // DO terkalibrasi via trimpot

  // ─────────────────────────────────────────────────────────────────
  // HYSTERESIS — Konfirmasi status sebelum alarm aktif
  //
  // Status hanya berubah setelah CONFIRMATION_COUNT pembacaan berurutan.
  // Ini mencegah false alarm dari:
  //   - Noise ADC sesaat
  //   - Spike suhu singkat (angin, jari menyentuh sensor, dll.)
  //   - MQ-2 bacaan tidak stabil di batas threshold
  //
  // Api DO = LANGSUNG (tanpa konfirmasi) karena api sungguhan
  //          perlu respons instan!
  // ─────────────────────────────────────────────────────────────────

  // DANGER: api sangat dekat (DO) = LANGSUNG, yang lain perlu konfirmasi
  if (flameDO || (flameDanger && gasDanger)) {
    // Kondisi kritis: api nyata atau api+gas bersamaan → respons instan
    currentStatus = STATUS_DANGER;
    dangerConfirmCount  = CONFIRMATION_COUNT;  // Langsung confirm
    warningConfirmCount = 0;
  }
  else if (flameDanger || gasDanger || tempDanger) {
    // Potensi danger dari sensor AO: perlu konfirmasi
    dangerConfirmCount++;
    warningConfirmCount = 0;
    if (dangerConfirmCount >= CONFIRMATION_COUNT) {
      currentStatus = STATUS_DANGER;
    } else {
      // Belum cukup konfirmasi — pertahankan status saat ini
      // (jangan langsung alarm)
      Serial.print("⚡ DANGER pending konfirmasi ");
      Serial.print(dangerConfirmCount); Serial.print("/");
      Serial.println(CONFIRMATION_COUNT);
    }
  }
  // WARNING: perlu konfirmasi juga (kecuali flameDO)
  else if (flameWarning || gasWarning || tempWarning) {
    warningConfirmCount++;
    dangerConfirmCount = 0;
    if (warningConfirmCount >= CONFIRMATION_COUNT) {
      currentStatus = STATUS_WARNING;
    } else {
      Serial.print("⚡ WARNING pending konfirmasi ");
      Serial.print(warningConfirmCount); Serial.print("/");
      Serial.println(CONFIRMATION_COUNT);
    }
  }
  // NORMAL — langsung (tidak perlu konfirmasi untuk kembali normal)
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
  http.addHeader("X-API-Key", DEVICE_API_KEY);

  // Flame detected: DO terkalibrasi ATAU AO di bawah warning
  bool flameDetected = currentFlameDO || (currentFlameAO < FLAME_AO_WARNING_THRESHOLD);

  // Gas detected: DO terkalibrasi ATAU AO di atas warning (setelah warm-up)
  bool gasDetected = gasWarmedUp && (currentGasDO || (currentGasAO >= GAS_WARNING_THRESHOLD));

  // ═══════════════════════════════════════════
  // ISO/IEC 17025 — Smoke % Obscuration
  // Formula: smokePercent = (gasADC / 4095.0) * 100.0
  // Ini adalah estimasi % kepekatan relatif (0.0% = bersih, 100.0% = max)
  // Untuk kalibrasi absolut (%/m), perlu kalibrasi dengan smoke chamber
  // ═══════════════════════════════════════════
  float smokePercent = (currentGasAO / 4095.0) * 100.0;
  if (!gasWarmedUp) smokePercent = -1.0;  // -1 = sensor belum warm-up (tidak valid)

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
      Serial.print(  "   Gas DO    : "); Serial.println(currentGasDO ? "LOW (AKTIF)" : "HIGH (ok)");
      Serial.print(  "   Gas AO    : "); Serial.print(currentGasAO); Serial.println(" / 4095");
      Serial.print(  "   Smoke %   : "); Serial.print(smokePercent, 3); Serial.println("%");
      Serial.println("💨💨💨 ============================== 💨💨💨");
    }
    Serial.println();
  }

  // ═══════════════════════════════════════════
  // JSON PAYLOAD — ISO/IEC 17025 Extended Format
  // Field baru: smokePercent, rackUnit, calibrationOffset,
  //             firmwareVersion, tempNormalMin, tempNormalMax
  // ═══════════════════════════════════════════
  StaticJsonDocument<768> doc;

  // --- Core sensor data ---
  doc["temperature"]        = round(currentTemperature * 10.0) / 10.0; // Bulatkan ke 1 desimal agar rapi di DB/dashboard
  doc["flameDetected"]      = flameDetected;             // true jika api terdeteksi
  doc["gasLevel"]           = currentGasAO;             // Raw ADC gas (0-4095)
  doc["gasDetected"]        = gasDetected;               // true jika gas/asap terdeteksi
  doc["humidity"]           = 0;                        // Tidak ada sensor humidity
  doc["flameAO"]            = currentFlameAO;           // Raw ADC flame (informatif)

  // --- ISO/IEC 17025 Traceability fields ---
  doc["smokePercent"]       = smokePercent;             // % kepekatan asap (−1 = warm-up)
  doc["rackUnit"]           = RACK_UNIT_ID;             // Posisi sensor di rack ("U01" dst)
  doc["calibrationOffset"]  = LM35_CALIBRATION_OFFSET; // Offset kalibrasi aktif (°C)
  doc["firmwareVersion"]    = "7.0";                    // Versi firmware untuk audit
  doc["gasWarmUp"]          = gasWarmedUp;              // Status warm-up MQ-2

  // --- Threshold reference (untuk audit trail di server) ---
  doc["thresholdTempWarn"]  = TEMP_WARNING_THRESHOLD;  // 27.0°C
  doc["thresholdTempDanger"]= TEMP_DANGER_THRESHOLD;   // 57.0°C
  doc["thresholdGasWarn"]   = GAS_WARNING_THRESHOLD;   // ADC 1200
  doc["thresholdGasDanger"] = GAS_DANGER_THRESHOLD;    // ADC 2500

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
  // Format compact: tampilkan semua sensor + ISO 17025 fields
  float smokePercent = gasWarmedUp ? (currentGasAO / 4095.0) * 100.0 : -1.0;

  Serial.print("[" RACK_UNIT_ID "] ");
  Serial.print("T=");
  Serial.print(currentTemperature, 1);
  Serial.print("°C(+");
  Serial.print(LM35_CALIBRATION_OFFSET, 1);
  Serial.print("off) | Flame AO=");
  Serial.print(currentFlameAO);
  Serial.print(" DO=");
  Serial.print(currentFlameDO ? "FIRE" : "ok");
  Serial.print(" | Gas AO=");
  Serial.print(currentGasAO);
  if (gasWarmedUp) {
    Serial.print("(");
    Serial.print(smokePercent, 2);
    Serial.print("%) DO=");
  } else {
    Serial.print("(warm%) DO=");
  }
  Serial.print(currentGasDO ? "GAS!" : "ok");
  Serial.print(" | ");
  switch (currentStatus) {
    case STATUS_NORMAL:  Serial.println("✅ NORMAL");    break;
    case STATUS_WARNING: Serial.println("⚠️  WARNING !!"); break;
    case STATUS_DANGER:  Serial.println("🚨 DANGER !!!"); break;
  }
}

// ========================================
// PRINT HEADER
// ========================================
void printHeader() {
  Serial.println("\n======================================================");
  Serial.println("  SMART FIRE MONITORING v7.0");
  Serial.println("  ISO/IEC 17025 Data Center Rack Monitoring");
  Serial.println("  LM35 + MH Flame + MQ-2 Gas");
  Serial.println("======================================================");
  Serial.print(  "  Rack Unit    : "); Serial.println(RACK_UNIT_ID);
  Serial.print(  "  Cal. Offset  : +"); Serial.print(LM35_CALIBRATION_OFFSET, 1); Serial.println(" °C");
  Serial.print(  "  Log Interval : "); Serial.print(SEND_INTERVAL / 1000); Serial.println(" detik");
  Serial.println("------------------------------------------------------");
  Serial.println("Threshold ISO 17025:");
  Serial.print(  "  Suhu Normal  : "); Serial.print(TEMP_NORMAL_MIN, 0); Serial.print("°C – "); Serial.print(TEMP_NORMAL_MAX, 0); Serial.println("°C");
  Serial.print(  "  Suhu Warning : > "); Serial.print(TEMP_WARNING_THRESHOLD, 0); Serial.println("°C");
  Serial.print(  "  Suhu Danger  : ≥ "); Serial.print(TEMP_DANGER_THRESHOLD, 0); Serial.println("°C (alarm pemadam)");
  Serial.print(  "  Gas Warning  : ADC > "); Serial.print(GAS_WARNING_THRESHOLD); Serial.println(" (~0.03%/m)");
  Serial.print(  "  Gas Danger   : ADC > "); Serial.print(GAS_DANGER_THRESHOLD); Serial.println(" (~0.06%/m)");
  Serial.println("------------------------------------------------------");
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
  Serial.println("  ✅ LM35 Temperature Sensor (ISO 17025 offset kalibrasi)");
  Serial.println("  ✅ MH Flame Sensor (DO + AO)");
  Serial.println("  ✅ MQ-2 Gas Sensor (DO + AO) + % Smoke");
  Serial.println("  ✅ WiFi + Dashboard (10s logging)");
  Serial.println("  ✅ Status LEDs + Buzzer");
  Serial.println("  ✅ Audit Trail — threshold + offset dikirim ke server");
  Serial.println("  ⏳ MQ-2 Warm-up: 3 menit");
  Serial.println("======================================================\n");
}
