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

## 🔌 Hardware Setup

### Komponen:
- ESP32 DevKit
- LM35DZ Temperature Sensor
- Flame Sensor MH Series (DO + AO)
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

### Step 1: Konfigurasi WiFi

Buka file `esp32_fire_monitor_complete.ino`, cari baris 40-41:

```cpp
const char* WIFI_SSID = "HIFIAIR_B20B";      // ← Ganti dengan WiFi Anda
const char* WIFI_PASSWORD = "Hifib55n!!";    // ← Ganti dengan password WiFi
```

### Step 2: Konfigurasi Server

Cari baris 47-48:

```cpp
const char* SERVER_URL = "http://192.168.1.197:3000/api/device/data";  // ← Ganti IP jika perlu
const char* API_KEY = "fg_d7eb1408826e8078ea9e4555c9cc7a8a7ab4a33b8a94d89d";  // ← API Key Anda
```

**Cara mendapatkan IP komputer**:
- **Mac**: Terminal → `ifconfig` → cari `inet`
- **Windows**: CMD → `ipconfig` → cari `IPv4 Address`

### Step 3: Kalibrasi (Opsional)

Jika sudah melakukan kalibrasi dengan `lm35_calibration_tool`, update offset di baris 63:

```cpp
#define LM35_CALIBRATION_OFFSET  0.0  // ← Ganti dengan offset Anda (contoh: +16.0)
```

### Step 4: Upload

```
1. Buka Arduino IDE
2. Buka: esp32_fire_monitor_complete.ino
3. Select Board: ESP32 Dev Module
4. Select Port: COM port ESP32
5. Upload (Ctrl+U)
6. Tunggu sampai selesai
```

### Step 5: Monitor

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

## 🔍 Troubleshooting

### WiFi Tidak Connect

**Gejala**:
```
📶 WiFi: ❌ Failed to connect
⚠️  Will retry in 5 seconds...
```

**Solusi**:
1. Cek SSID dan password benar
2. Pastikan WiFi 2.4GHz (bukan 5GHz)
3. Dekatkan ESP32 ke router
4. Restart ESP32 (tekan tombol EN)

### Data Tidak Terkirim

**Gejala**:
```
📈 Stats: Success=0 | Fail=5
```

**Solusi**:
1. Cek server running: `bun run dev`
2. Cek IP address benar
3. Cek firewall tidak block port 3000
4. Cek API Key benar

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

**Version**: 4.0 Complete Edition
**Date**: May 9, 2026
**Status**: ✅ Production Ready

**Siap untuk tugas kampus dan production!** 🎓🔥
