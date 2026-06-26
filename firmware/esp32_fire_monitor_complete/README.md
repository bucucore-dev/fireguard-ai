# 🔥 Smart Fire Monitoring - Complete Edition

## 📋 Overview

Firmware **LENGKAP** dengan **SEMUA FITUR TERBAIK** dari semua firmware sebelumnya!

### ✅ Features

**Dari `esp32_fire_monitor_pro.ino`**:
- ✅ Multi-sensor fusion (LM35 + Flame DO + Flame AO)
- ✅ Auto-calibration
- ✅ Anti false positive (Advanced)
- ✅ Confirmation count (3 readings)
- ✅ Temperature-only mode (when flame sensor broken)
- ✅ Professional Serial output

**Dari `esp32_fire_monitor_wifi.ino`**:
- ✅ WiFi connection
- ✅ Send data to server (every 5 seconds)
- ✅ Dashboard integration
- ✅ LED indicators with smart blinking
- ✅ Auto-reconnect WiFi

**Dari `lm35_calibration_tool.ino`**:
- ✅ Calibration offset support
- ✅ Accurate temperature reading

**BONUS**:
- ✅ Real-time monitoring
- ✅ Statistics (success/fail count)
- ✅ WiFi signal strength (RSSI)
- ✅ Smooth LED transitions

---

## 📚 Prerequisites

### Software Requirements

#### 1. Install Arduino IDE

**Download & Install:**
- Kunjungi: https://www.arduino.cc/en/software
- Download Arduino IDE 2.x (Recommended)
- Install sesuai sistem operasi Anda

#### 2. Install ESP32 Board Support

1. Buka Arduino IDE
2. Go to **File** → **Preferences**
3. Di **Additional Board Manager URLs**, tambahkan:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Click **OK**
5. Go to **Tools** → **Board** → **Boards Manager**
6. Search "ESP32"
7. Install **"esp32 by Espressif Systems"** (versi 2.0.x atau lebih baru)

#### 3. Install Required Libraries

**Via Library Manager (Recommended):**

1. Go to **Tools** → **Manage Libraries** (atau Ctrl+Shift+I)
2. Search dan install library berikut:

**📦 ArduinoJson** (by Benoit Blanchon)
```
Search: ArduinoJson
Install: Version 6.21.0 or newer
```

**Verify Installation:**
- Go to **Sketch** → **Include Library**
- Cek apakah **ArduinoJson** muncul di daftar

**Alternative - Manual Installation:**

```bash
# Download from GitHub
# https://github.com/bblanchon/ArduinoJson/releases

# Extract ke:
# Windows: Documents/Arduino/libraries/
# Mac: ~/Documents/Arduino/libraries/
# Linux: ~/Arduino/libraries/

# Restart Arduino IDE
```

**Built-in Libraries (No Installation Needed):**
- ✅ WiFi.h (ESP32 built-in)
- ✅ HTTPClient.h (ESP32 built-in)

---

## 🔌 Hardware Setup

### Komponen:
- ESP32 DevKit
- LM35DZ Temperature Sensor
- Flame Sensor MH Series (DO + AO) - *Optional*
- 3x LED (Hijau, Kuning, Merah)
- Resistor 220Ω (untuk LED)
- Breadboard & Kabel jumper

### Wiring:

**⚠️ PENTING: GPIO 35 untuk LM35 (BUKAN GPIO 5!)**

```
LM35DZ:
  Pin 1 (VCC)  → Breadboard + Rail (3.3V)
  Pin 2 (VOUT) → ESP32 GPIO35 (ADC1_CH7)
  Pin 3 (GND)  → Breadboard - Rail (GND)

Power Rails Setup:
  ESP32 3.3V (J-row) → Breadboard + Rail
  ESP32 GND  (J-row) → Breadboard - Rail

Flame Sensor:
  VCC → Breadboard + Rail (atau ESP32 3.3V)
  GND → Breadboard - Rail (atau ESP32 GND)
  DO  → ESP32 GPIO27
  AO  → ESP32 GPIO32 (ADC1_CH4) - CHANGED from GPIO 35!

LED:
  LED Hijau:
    Anode (+) → ESP32 GPIO18
    Cathode (-) → Resistor 220Ω → GND
  
  LED Kuning:
    Anode (+) → ESP32 GPIO19
    Cathode (-) → Resistor 220Ω → GND
  
  LED Merah:
    Anode (+) → ESP32 GPIO21
    Cathode (-) → Resistor 220Ω → GND
```

**📖 Lihat WIRING-GUIDE.md untuk diagram lengkap dan troubleshooting!**

---

## 🚀 Quick Start

### Step 1: Konfigurasi WiFi & Server

**⚠️ PENTING: Gunakan file `config.h` untuk konfigurasi yang aman!**

```bash
# Di folder firmware/esp32_fire_monitor_complete/
cp config.h.example config.h
```

Kemudian edit file `config.h`:

```cpp
// ===================================
// WiFi Configuration
// ===================================
#define WIFI_SSID "Your_WiFi_SSID"        // ← Ganti dengan WiFi Anda
#define WIFI_PASSWORD "Your_WiFi_Password" // ← Ganti dengan password WiFi

// ===================================
// Server Configuration
// ===================================
#define SERVER_URL "http://192.168.1.197:3000/api/device/data"  // ← Ganti IP
#define API_KEY "fg_your_api_key_here"                          // ← API Key Anda
#define DEVICE_ID "IoTDevice-0x143000001"                       // ← ID Unik

// ===================================
// Location Configuration (EPSG:4326)
// ===================================
#define DEVICE_LATITUDE  -6.2088    // ← Latitude perangkat
#define DEVICE_LONGITUDE  106.8456  // ← Longitude perangkat
```

**💡 Catatan Keamanan:**
- File `config.h` sudah ada di `.gitignore` (tidak akan ter-commit ke Git)
- Jangan share file `config.h` Anda ke public
- Gunakan `config.h.example` sebagai template

**Cara mendapatkan IP komputer**:
- **Mac/Linux**: Terminal → `ifconfig` → cari `inet`
- **Windows**: CMD → `ipconfig` → cari `IPv4 Address`

**Cara mendapatkan koordinat lokasi:**
1. Buka [Google Maps](https://maps.google.com)
2. Klik kanan pada lokasi perangkat
3. Copy koordinat (contoh: -6.2088, 106.8456)
4. Paste ke `DEVICE_LATITUDE` dan `DEVICE_LONGITUDE`

### Step 2: Kalibrasi (Opsional)

Jika sudah melakukan kalibrasi dengan `lm35_calibration_tool`, update offset di file `config.h`:

```cpp
// ===================================
// Calibration Configuration
// ===================================
#define LM35_CALIBRATION_OFFSET  0.0  // ← Ganti dengan offset Anda (contoh: +16.0)
```

### Step 3: Upload

```
1. Buka Arduino IDE
2. Buka file: esp32_fire_monitor_complete.ino
3. Pastikan config.h sudah ada dan sudah diisi
4. Select Board: ESP32 Dev Module
5. Select Port: COM port ESP32 (Windows) atau /dev/cu.usbserial-xxx (Mac)
6. Upload (Ctrl+U atau tombol Upload)
7. Tunggu sampai selesai
```

### Step 4: Monitor

```
1. Buka Serial Monitor (115200 baud)
2. Lihat output:
   ========================================
     SMART FIRE MONITORING - COMPLETE
   ========================================
   Version: 4.0 Complete Edition
   Features:
     ✅ Multi-sensor Fusion
     ✅ Anti False Positive
     ✅ WiFi + Dashboard
     ✅ Professional Output
     ✅ LED Indicators
     ✅ Calibration Support
   ========================================

   📶 Connecting to WiFi: HIFIAIR_B20B
   📶 WiFi: ✅ Connected
   🌐 IP Address: 192.168.1.XXX
   📡 Signal: -52 dBm
   ========================================

   ✅ System Ready!
   ========================================
```

### Step 5: Dapatkan API Key dari Dashboard

1. Buka browser dan jalankan development server:
   ```bash
   # Di folder root proyek (bukan folder firmware)
   bun run dev
   # atau dengan logging
   bun run dev:log
   ```

2. Buka dashboard: `http://localhost:3000`
3. Pergi ke halaman **Devices**
4. Klik **Add Device**
5. Isi informasi perangkat:
   - Device Name: `ESP32 - Ruang Server` (contoh)
   - Device ID: `IoTDevice-0x143000001` (sama dengan di config.h)
   - Location: `Jakarta - Monas` (opsional)
   - Latitude: `-6.2088` (sama dengan di config.h)
   - Longitude: `106.8456` (sama dengan di config.h)
6. Klik **Add Device**
7. Klik card perangkat untuk membuka modal detail
8. Copy API key (klik ikon mata untuk menampilkan)
9. Paste ke file `config.h` di `API_KEY`

### Step 6: Cek Dashboard

```
1. Buka browser: http://192.168.1.197:3000
2. Data harus muncul dalam 5 detik!
3. Cek:
   - Temperature: 12.8°C
   - Status: NORMAL
   - Last seen: Just now
   - Recent logs: Update setiap 5 detik
```

---

## 📺 Output Example

### Serial Monitor:

```
========================================
📶 WiFi: ✅ Connected (-52 dBm)
🌡️  Temperature: 12.8°C [NORMAL]
🔥 Flame DO: NO
📊 Flame AO: 3500 / 4095 [NORMAL]
🚦 Status: ✅ NORMAL
💡 LED: GREEN BLINKING (ON 2s, OFF 1s)
📈 Stats: Success=10 | Fail=0

========================================
```

### Dashboard:

```
Dashboard → Devices → ESP32 Device
┌─────────────────────────────────────┐
│ ESP32 Device                        │
│ Status: Online ✅                   │
│                                     │
│ Temperature: 12.8°C                 │
│ Flame: Clear                        │
│ Last seen: Just now                 │
│                                     │
│ Recent Logs:                        │
│ • 12.8°C (normal) - 5 seconds ago   │
│ • 12.7°C (normal) - 10 seconds ago  │
│ • 12.9°C (normal) - 15 seconds ago  │
└─────────────────────────────────────┘
```

---

## 🎯 System Behavior

### Mode 1: Multi-Sensor (Normal)

**Kondisi**: Flame AO >= 100 (sensor working)

**Logic**:
```
NORMAL:
- Temperature < 40°C
- Flame DO = NO
- Flame AO > 2000
→ LED Hijau berkedip (ON 2s, OFF 1s)

WARNING:
- Temperature 40-55°C OR
- Flame AO 1000-2000 OR
- Flame DO = YES (not confirmed)
→ LED Kuning berkedip (ON 1s, OFF 1s)

DANGER:
- Temperature > 55°C OR
- Flame DO = YES + AO < 1000 OR
- AO < 1000 + Temp rising
→ LED Merah berkedip (ON 0.5s, OFF 0.5s)
```

**Confirmation**: Perlu 3 pembacaan berturut untuk trigger WARNING/DANGER

### Mode 2: Temperature-Only (Fallback)

**Kondisi**: Flame AO < 100 (sensor saturated/broken)

**Logic**:
```
NORMAL:
- Temperature < 40°C
→ LED Hijau berkedip

WARNING:
- Temperature 40-55°C
→ LED Kuning berkedip

DANGER:
- Temperature > 55°C
→ LED Merah berkedip
```

**Output**:
```
📊 Flame AO: 0 / 4095 [SENSOR MALFUNCTION - IGNORED!]
⚠️  WARNING: Flame sensor saturated/broken - Using temperature only!
```

---

## 🔧 Configuration

### Temperature Thresholds:

```cpp
#define TEMP_WARNING_THRESHOLD    40.0  // °C
#define TEMP_DANGER_THRESHOLD     55.0  // °C
```

**Sesuaikan dengan kebutuhan**:
- Ruangan normal: 40°C / 55°C (default)
- Ruangan panas: 50°C / 65°C
- Ruangan dingin: 35°C / 50°C

### Flame Sensor Thresholds:

```cpp
#define AO_WARNING_THRESHOLD      2000
#define AO_DANGER_THRESHOLD       1000
#define AO_VALID_MINIMUM          100
```

**Tuning**:
- Jika terlalu sensitif (false alarm): Turunkan threshold (contoh: 1500, 800)
- Jika kurang sensitif: Naikkan threshold (contoh: 2500, 1500)

### Confirmation Count:

```cpp
#define CONFIRMATION_COUNT        3
```

**Tuning**:
- Lebih ketat (kurang false alarm): 5
- Lebih cepat (lebih responsif): 2
- Default: 3 (recommended)

### Send Interval:

```cpp
#define SEND_INTERVAL             5000  // ms
```

**Tuning**:
- Lebih sering: 3000 (3 detik)
- Lebih jarang: 10000 (10 detik)
- Default: 5000 (5 detik, recommended)

---

## 🐛 Troubleshooting

### Compilation Errors

#### Error: `ArduinoJson.h: No such file or directory`

**Penyebab:** Library ArduinoJson belum diinstall.

**Solusi:**

1. **Via Library Manager (Recommended):**
   ```
   Arduino IDE → Tools → Manage Libraries (Ctrl+Shift+I)
   Search: ArduinoJson
   Install: ArduinoJson by Benoit Blanchon (v6.21.0+)
   ```

2. **Verify Installation:**
   ```
   Sketch → Include Library → Check if "ArduinoJson" exists
   ```

3. **Restart Arduino IDE** setelah install

4. **Try compile again** (Ctrl+R)

**Manual Installation (Alternative):**
```bash
# Download: https://github.com/bblanchon/ArduinoJson/releases
# Extract to: Documents/Arduino/libraries/ArduinoJson/
# Restart Arduino IDE
```

---

#### Error: `WiFi.h: No such file or directory`

**Penyebab:** ESP32 board support belum diinstall.

**Solusi:**
1. Go to **Tools** → **Board** → **Boards Manager**
2. Search "ESP32"
3. Install **"esp32 by Espressif Systems"**
4. Select Board: **Tools** → **Board** → **ESP32 Arduino** → **ESP32 Dev Module**
5. Try compile again

---

#### Error: `Board not found`

**Solusi:**
1. Install ESP32 board support (see above)
2. Restart Arduino IDE
3. Select Board: **ESP32 Dev Module**
4. Select Port: **COMx** (Windows) or **/dev/cu.usbserial-xxx** (Mac)

---

### File config.h Tidak Ada

**Gejala**:
```
esp32_fire_monitor_complete.ino:XX:XX: fatal error: config.h: No such file or directory
```

**Solusi**:
```bash
# Di folder firmware/esp32_fire_monitor_complete/
cp config.h.example config.h
# Edit config.h dengan konfigurasi Anda
```

### WiFi Tidak Connect

**Gejala**:
```
📶 WiFi: ❌ Failed to connect
⚠️  Will retry in 5 seconds...
```

**Solusi**:
1. Cek SSID dan password benar di `config.h`
2. Pastikan WiFi 2.4GHz (bukan 5GHz)
3. Dekatkan ESP32 ke router
4. Restart ESP32 (tekan tombol EN)
5. Cek Serial Monitor untuk pesan error detail

### Data Tidak Terkirim

**Gejala**:
```
📈 Stats: Success=0 | Fail=5
```

**Solusi**:
1. Cek server running di terminal lain:
   ```bash
   # Windows
   bun run dev

   # Mac/Linux
   bun run dev
   
   # Dengan logging (semua platform)
   bun run dev:log
   ```
2. Cek IP address benar di `config.h`
3. Cek firewall tidak block port 3000:
   - Windows: Windows Defender Firewall → Allow app → Node.js/Bun
   - Mac: System Preferences → Security → Firewall → Allow
4. Cek API Key benar di `config.h` (harus sama dengan dashboard)

### Dashboard Tidak Muncul

**Gejala**:
- Serial Monitor: ✅ Data sent successfully
- Dashboard: Tidak ada data

**Solusi**:
1. Refresh browser (Ctrl+R)
2. Cek device sudah terdaftar
3. Cek API Key match dengan device
4. Cek database connection

### LED Tidak Menyala

**Gejala**:
- Serial Monitor: 💡 LED: GREEN BLINKING
- LED: Tidak menyala

**Solusi**:
1. Cek wiring LED (anode ke GPIO, cathode ke GND)
2. Cek resistor 220Ω terpasang
3. Cek LED tidak rusak (test dengan multimeter)
4. Cek GPIO pin benar (18, 19, 21)

### Flame Sensor Selalu DANGER

**Gejala**:
```
📊 Flame AO: 0 / 4095 [SENSOR MALFUNCTION - IGNORED!]
⚠️  WARNING: Flame sensor saturated/broken - Using temperature only!
🚦 Status: ✅ NORMAL
```

**Ini NORMAL!** Sistem otomatis switch ke temperature-only mode.

**Solusi** (opsional):
1. Tutup flame sensor dengan selotip hitam (samping)
2. Jauhkan dari lampu terang
3. Ganti sensor baru
4. Atau biarkan saja (sistem tetap berfungsi dengan temperature)

---

## 📊 Comparison

| Feature | Pro (No WiFi) | WiFi (Basic) | **Complete** |
|---------|---------------|--------------|--------------|
| Multi-sensor fusion | ✅ | ⚠️ Basic | ✅ |
| Anti false positive | ✅ Advanced | ⚠️ Basic | ✅ Advanced |
| Temperature-only mode | ✅ | ❌ | ✅ |
| WiFi | ❌ | ✅ | ✅ |
| Dashboard | ❌ | ✅ | ✅ |
| LED indicators | ❌ | ✅ | ✅ |
| Calibration offset | ❌ | ✅ | ✅ |
| Professional output | ✅ | ⚠️ Basic | ✅ |
| Statistics | ❌ | ⚠️ Basic | ✅ |
| WiFi RSSI | ❌ | ❌ | ✅ |

---

## 🎉 Summary

### Firmware ini adalah:

✅ **ALL-IN-ONE** solution untuk fire monitoring
✅ **Production-ready** dengan semua fitur
✅ **Robust** dengan fallback mode
✅ **Professional** dengan output lengkap
✅ **Real-time** dengan dashboard integration
✅ **Smart** dengan anti false positive

### Setelah upload:

✅ Data muncul di dashboard (real-time)
✅ LED berkedip sesuai status
✅ Serial Monitor menampilkan info lengkap
✅ WiFi auto-reconnect jika disconnect
✅ Flame sensor auto-ignored jika broken
✅ Temperature monitoring tetap jalan

---

## 🌐 Integrasi dengan Web Application

### Menjalankan Server Development

**Cross-Platform (Windows, Mac, Linux):**

```bash
# Navigasi ke root folder proyek
cd ../..  # dari folder firmware/esp32_fire_monitor_complete

# Install dependencies (pertama kali saja)
bun install

# Jalankan development server
bun run dev

# Atau dengan logging ke file
bun run dev:log
```

**Opsi NPM (alternatif):**
```bash
npm install
npm run dev
```

### File Log

Script logging (`dev:log` dan `start:log`) akan membuat file log:
- `dev.log` - Log dari development server
- `server.log` - Log dari production server

File log ini:
- ✅ Sudah di-gitignore (tidak akan ter-commit)
- ✅ Menampilkan output di terminal DAN file
- ✅ Cross-platform (Windows, Mac, Linux)

### Production Deployment

```bash
# Build untuk production
bun run build

# Jalankan production server
bun run start

# Atau dengan logging
bun run start:log
```

### Port dan Akses

- **Development**: `http://localhost:3000`
- **Production**: Sesuai konfigurasi server
- **API Endpoint**: `/api/device/data`

### Keamanan

⚠️ **JANGAN commit file berikut**:
- `firmware/**/config.h` - Kredensial WiFi & API Key
- `.env` - Environment variables
- `*.log` - File log

✅ **Aman untuk commit**:
- `config.h.example` - Template tanpa kredensial
- `.env.example` - Template environment variables

---

**Version**: 4.0 Complete Edition
**Date**: May 9, 2026
**Status**: ✅ Production Ready
**Platform Support**: ✅ Windows, Mac, Linux

**Siap untuk tugas kampus dan production!** 🎓🔥
