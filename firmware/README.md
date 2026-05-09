# 🔥 ESP32 Fire Monitor Firmware

Firmware untuk sistem monitoring kebakaran menggunakan ESP32, sensor suhu LM35, dan flame sensor.

---

## 📋 Hardware Requirements

### Components:
- **ESP32 DevKit** (1x)
- **LM35DZ Temperature Sensor** (1x)
- **MH Series Flame Sensor** (1x)
- **LED Hijau** (1x)
- **LED Kuning** (1x)
- **LED Merah** (1x)
- **Resistor 220Ω - 1kΩ** (3x untuk LED)
- **Breadboard & Jumper Wires**

---

## 🔌 Wiring Diagram

### LM35 Temperature Sensor:
```
LM35 Pin 1 (VCC)  → ESP32 3.3V
LM35 Pin 2 (VOUT) → ESP32 GPIO34 (ADC)
LM35 Pin 3 (GND)  → ESP32 GND
```

### MH Flame Sensor:
```
Flame VCC → ESP32 5V (atau 3.3V, cek datasheet)
Flame GND → ESP32 GND
Flame DO  → ESP32 GPIO27 (Digital Output)
Flame AO  → ESP32 GPIO35 (Analog Output)
```

### LEDs:
```
LED Hijau:
  Anode (+) → Resistor 220Ω → ESP32 GPIO18
  Katode (-) → ESP32 GND

LED Kuning:
  Anode (+) → Resistor 220Ω → ESP32 GPIO19
  Katode (-) → ESP32 GND

LED Merah:
  Anode (+) → Resistor 220Ω → ESP32 GPIO21
  Katode (-) → ESP32 GND
```

**Visual Diagram:**
```
         ESP32 DevKit
    ┌─────────────────────┐
    │                     │
    │  3.3V ──────────┐   │
    │  GND  ──────┐   │   │
    │             │   │   │
    │  GPIO34 ────┼───┼───┼─── LM35 VOUT
    │  GPIO27 ────┼───┼───┼─── Flame DO
    │  GPIO35 ────┼───┼───┼─── Flame AO
    │             │   │   │
    │  GPIO18 ────┼───┼───┼─── LED Hijau
    │  GPIO19 ────┼───┼───┼─── LED Kuning
    │  GPIO21 ────┼───┼───┼─── LED Merah
    │             │   │   │
    └─────────────┴───┴───┘
                  │   │
                 GND 3.3V
```

---

## 🚀 Installation

### 1. Install Arduino IDE

Download dari: https://www.arduino.cc/en/software

### 2. Install ESP32 Board Support

1. Buka Arduino IDE
2. File → Preferences
3. Tambahkan URL di "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Tools → Board → Boards Manager
5. Cari "ESP32" dan install "esp32 by Espressif Systems"

### 3. Select Board

1. Tools → Board → ESP32 Arduino → **ESP32 Dev Module**
2. Tools → Port → Pilih port COM ESP32 Anda

### 4. Upload Firmware

1. Buka file `esp32_fire_monitor.ino`
2. Klik tombol **Upload** (→)
3. Tunggu hingga selesai
4. Buka Serial Monitor (Ctrl+Shift+M atau Tools → Serial Monitor)
5. Set baud rate ke **115200**

---

## 📊 System Logic

### Status Levels:

| Status | Condition | LED |
|--------|-----------|-----|
| **NORMAL** | Suhu < 40°C & Tidak ada api | 🟢 Hijau ON |
| **WARNING** | Suhu 40-55°C ATAU Flame ringan | 🟡 Kuning BLINK |
| **DANGER** | Suhu > 55°C ATAU Flame terdeteksi | 🔴 Merah BLINK |

### Decision Tree:
```
┌─────────────────────────────────────┐
│ Read Temperature & Flame Sensor     │
└──────────────┬──────────────────────┘
               │
               ▼
       ┌───────────────┐
       │ Temp > 55°C?  │
       │ OR Flame DO?  │
       └───────┬───────┘
               │
        ┌──────┴──────┐
        │             │
       YES           NO
        │             │
        ▼             ▼
    ┌───────┐   ┌──────────────┐
    │DANGER │   │ Temp 40-55°C?│
    │  🔴   │   │ OR Flame AO? │
    └───────┘   └──────┬───────┘
                       │
                ┌──────┴──────┐
                │             │
               YES           NO
                │             │
                ▼             ▼
           ┌────────┐    ┌────────┐
           │WARNING │    │ NORMAL │
           │   🟡   │    │   🟢   │
           └────────┘    └────────┘
```

---

## 🔧 Configuration

### Temperature Thresholds:

Edit di bagian `CONFIGURATION`:

```cpp
#define TEMP_NORMAL_MAX     40.0  // Batas atas NORMAL (°C)
#define TEMP_WARNING_MAX    55.0  // Batas atas WARNING (°C)
```

### Flame Sensor Threshold:

```cpp
#define FLAME_ANALOG_THRESHOLD  2000  // Threshold flame ringan (0-4095)
```

**Cara Setting:**
1. Upload firmware
2. Buka Serial Monitor
3. Lihat nilai "Flame Analog" saat tidak ada api
4. Nyalakan api kecil, lihat nilai turun
5. Set threshold di antara nilai "ada api" dan "tidak ada api"

### LM35 Calibration:

```cpp
#define LM35_OFFSET  0.0  // Offset kalibrasi (°C)
```

**Cara Kalibrasi:**
1. Ukur suhu ruangan dengan termometer akurat
2. Bandingkan dengan pembacaan ESP32
3. Hitung offset: `Offset = Suhu_Sebenarnya - Suhu_ESP32`
4. Update `LM35_OFFSET`

**Contoh:**
- Termometer: 25.0°C
- ESP32: 27.5°C
- Offset: 25.0 - 27.5 = **-2.5**
- Set: `#define LM35_OFFSET -2.5`

---

## 📺 Serial Monitor Output

### Normal Output:
```
----------------------------------------
🌡️  Temperature: 36.7°C
🔥 Flame Digital: NO
   Flame Analog: 3500 / 4095 (NONE)
📊 Status: ✅ NORMAL
💡 LED: GREEN ON
```

### Warning Output:
```
----------------------------------------
🌡️  Temperature: 47.3°C
🔥 Flame Digital: NO
   Flame Analog: 1800 / 4095 (LOW INTENSITY)
📊 Status: ⚠️  WARNING
💡 LED: YELLOW BLINKING
```

### Danger Output:
```
----------------------------------------
🌡️  Temperature: 61.2°C
🔥 Flame Digital: DETECTED ⚠️
   Flame Analog: 800 / 4095 (HIGH INTENSITY)
📊 Status: 🚨 DANGER!
💡 LED: RED BLINKING
```

---

## 🐛 Troubleshooting

### Problem: LED tidak menyala

**Penyebab:**
- Koneksi LED terbalik (anode/katode)
- Resistor tidak terpasang
- Pin GPIO salah

**Solusi:**
1. Cek polaritas LED (kaki panjang = anode/+)
2. Pastikan resistor 220Ω terpasang
3. Test manual:
   ```cpp
   digitalWrite(PIN_LED_GREEN, HIGH);
   delay(1000);
   digitalWrite(PIN_LED_GREEN, LOW);
   ```

### Problem: Suhu tidak akurat

**Penyebab:**
- Koneksi LM35 salah
- Voltage reference tidak tepat
- Perlu kalibrasi

**Solusi:**
1. Cek koneksi LM35:
   - Pin 1 (flat side kiri) → 3.3V
   - Pin 2 (tengah) → GPIO34
   - Pin 3 (kanan) → GND
2. Lakukan kalibrasi offset (lihat bagian Configuration)
3. Cek Serial Monitor untuk nilai ADC raw

### Problem: Flame sensor tidak responsif

**Penyebab:**
- Sensitivitas terlalu rendah
- Jarak terlalu jauh
- Modul rusak

**Solusi:**
1. Putar potentiometer di modul flame sensor (searah jarum jam = lebih sensitif)
2. Test dengan api lilin pada jarak 10-30cm
3. Cek nilai analog di Serial Monitor
4. Sesuaikan `FLAME_ANALOG_THRESHOLD`

### Problem: Pembacaan suhu "out of range"

**Penyebab:**
- Koneksi LM35 longgar
- Noise pada ADC
- LM35 rusak

**Solusi:**
1. Cek koneksi kabel
2. Tambahkan kapasitor 0.1µF antara VOUT dan GND LM35
3. Ganti LM35 jika masih error

---

## 🔄 Next Steps: WiFi Integration

Untuk mengirim data ke FireGuard AI dashboard:

### 1. Tambahkan WiFi Library:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://your-server.com/api/device/data";
const char* apiKey = "fg_YOUR_API_KEY";
```

### 2. Connect WiFi di setup():

```cpp
void setup() {
  // ... existing code ...
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}
```

### 3. Send Data di loop():

```cpp
void sendDataToServer() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    String payload = "{";
    payload += "\"temperature\":" + String(currentTemperature) + ",";
    payload += "\"humidity\":0,";  // Jika ada sensor humidity
    payload += "\"flameDetected\":" + String(flameDetectedDigital ? "true" : "false");
    payload += "}";
    
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", apiKey);
    
    int httpCode = http.POST(payload);
    
    if (httpCode > 0) {
      Serial.printf("✅ Data sent! HTTP: %d\n", httpCode);
    } else {
      Serial.printf("❌ Send failed: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
  }
}
```

### 4. Call di loop():

```cpp
void loop() {
  // ... existing code ...
  
  // Send data every 5 seconds
  static unsigned long lastSend = 0;
  if (millis() - lastSend >= 5000) {
    sendDataToServer();
    lastSend = millis();
  }
  
  delay(LOOP_DELAY);
}
```

---

## 📚 Additional Features (Optional)

### 1. Buzzer Alarm:

```cpp
#define PIN_BUZZER 22

void setup() {
  pinMode(PIN_BUZZER, OUTPUT);
}

void updateBuzzer() {
  if (currentStatus == STATUS_DANGER) {
    tone(PIN_BUZZER, 1000, 200);  // Beep 1kHz, 200ms
  } else {
    noTone(PIN_BUZZER);
  }
}
```

### 2. LCD Display (I2C):

```cpp
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
}

void updateLCD() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(currentTemperature, 1);
  lcd.print("C");
  
  lcd.setCursor(0, 1);
  lcd.print("Status: ");
  if (currentStatus == STATUS_NORMAL) lcd.print("OK");
  else if (currentStatus == STATUS_WARNING) lcd.print("WARN");
  else lcd.print("DANGER");
}
```

### 3. SD Card Logging:

```cpp
#include <SD.h>
#include <SPI.h>

#define PIN_SD_CS 5

void logToSD() {
  File dataFile = SD.open("log.txt", FILE_APPEND);
  if (dataFile) {
    dataFile.print(millis());
    dataFile.print(",");
    dataFile.print(currentTemperature);
    dataFile.print(",");
    dataFile.println(flameDetectedDigital);
    dataFile.close();
  }
}
```

---

## 📖 References

- [ESP32 Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf)
- [LM35 Datasheet](https://www.ti.com/lit/ds/symlink/lm35.pdf)
- [Arduino ESP32 Documentation](https://docs.espressif.com/projects/arduino-esp32/en/latest/)

---

## 📄 License

MIT License - Free to use and modify

---

## 👨‍💻 Support

Jika ada pertanyaan atau masalah:
1. Cek troubleshooting guide di atas
2. Buka issue di GitHub repository
3. Hubungi tim FireGuard AI

---

**Happy Monitoring!** 🔥🚀
