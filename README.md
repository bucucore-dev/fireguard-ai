# 🔥 FireGuardAI - Sistem Monitoring Kebakaran IoT

<div align="center">

![FireGuardAI - Pemetaan Lokasi Sensor](public/Location%20Sensor.png)

**Sistem Deteksi & Monitoring Kebakaran Cerdas dengan AI Assistant**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*Monitoring IoT real-time dengan peta interaktif, AI assistant, dan integrasi ESP32*

[Fitur](#-fitur) • [Demo](#-demo) • [Instalasi](#-instalasi) • [Setup Hardware](#-setup-hardware) • [Penggunaan](#-penggunaan) • [Dokumentasi API](#-dokumentasi-api)

</div>

---

## 📖 Ringkasan

FireGuardAI adalah sistem monitoring kebakaran berbasis IoT yang mengintegrasikan sensor ESP32 dengan dashboard web real-time dan AI assistant. Sistem ini dirancang untuk mendeteksi suhu tinggi, gas berbahaya, api, dan kondisi berbahaya lainnya, kemudian memberikan alert dan analisis melalui interface yang user-friendly.

### 🎯 Fitur Utama

- ✅ **Monitoring Real-time 3 Sensor** - Monitor suhu (LM35), deteksi api (MH Flame), dan konsentrasi gas/asap (MQ-2) secara real-time
- 🤖 **AI Assistant** - Chatbot cerdas dengan OpenRouter untuk analisis dan troubleshooting
- 📍 **Pelacakan Lokasi** - Pemetaan perangkat dengan koordinat GPS (EPSG:4326/WGS 84)
- 📊 **Visualisasi Data & Ekspor** - Grafik untuk analisis trend dan fitur Ekspor Laporan CSV
- 🔔 **Alert Cerdas** - Notifikasi peringatan dan sirine (LED & Buzzer pada hardware)
- 🌐 **Multi-Database** - Mendukung SQLite, PostgreSQL, dan Supabase
- 🔐 **Autentikasi API Key** - Keamanan perangkat dengan API key
- 🎨 **Dark Mode** - Interface modern dengan dukungan dark mode

---

## 🖼️ Demo

### 📱 Perangkat ESP32

<div align="center">
<table>
<tr>
<td align="center">
<br/>
<b>Perangkat ESP32 dengan 3 Sensor Utama</b>
<br/>
Sensor Suhu, Sensor Api, dan Sensor Gas MQ-2
</td>
<td align="center">
<br/>
<b>Indikator LED & Buzzer</b>
<br/>
Peringatan Dini secara Fisik
</td>
</tr>
</table>
</div>

### 🤖 AI Chatbot Assistant

<div align="center">
<img src="public/AI_chatbot.png" alt="AI Chatbot" width="600"/>
<br/>
<b>AI Assistant dengan Integrasi Data Real-time</b>
<br/>
Tanyakan pertanyaan, dapatkan insight, dan troubleshoot masalah
</div>

### 📍 Pemetaan Lokasi Sensor

<div align="center">
<img src="public/Location Sensor.png" alt="Location Sensor" width="600"/>
<br/>
<b>Peta Interaktif dengan Lokasi Perangkat</b>
<br/>
Lacak semua perangkat dengan koordinat GPS (EPSG:4326)
</div>

---

## ✨ Fitur

### 🔥 Deteksi & Monitoring Kebakaran
- **Monitoring Suhu** - Pelacakan suhu real-time dengan alert threshold ✅ **Aktif**
- **Deteksi Api** - Integrasi sensor api optik MH Flame ✅ **Aktif**
- **Deteksi Level Gas** - Monitor konsentrasi gas berbahaya/asap dengan sensor MQ-2 ✅ **Aktif**
- **Sistem Sirine Fisik** - Peringatan visual (LED) dan audio (Buzzer) pada perangkat ✅ **Aktif**
- **Level Status** - Indikator status Normal, Warning, Danger, Critical ✅ **Aktif**

### 🤖 AI-Powered Assistant
- **Analisis Data Real-time** - AI menganalisis data sensor aktual
- **Query Berbasis Lokasi** - "Tampilkan perangkat di Jakarta"
- **Bantuan Troubleshooting** - Panduan langkah demi langkah untuk masalah
- **Riwayat Chat** - localStorage 7 hari dengan auto-expire

### 📊 Dashboard & Analytics
- **KPI Card Real-time** - Total perangkat, status online, rata-rata suhu, alert
- **Ekspor Laporan** - Unduh laporan insiden dalam format CSV
- **Peta Interaktif** - Peta Leaflet dengan marker dan popup perangkat
- **Grafik Suhu** - Riwayat suhu 24 jam dengan Chart.js
- **Manajemen Perangkat** - Tambah, edit, hapus perangkat dengan interface modal

### 📍 Fitur Lokasi
- **Koordinat GPS** - Standar EPSG:4326 (WGS 84)
- **Auto-detect Lokasi** - Browser geolocation API
- **Input Manual** - Latitude/longitude dengan validasi
- **Integrasi Peta** - OpenStreetMap dengan dukungan dark mode
- **Kalkulasi Jarak** - Hitung jarak antar perangkat

### 🔐 Keamanan & Autentikasi
- **Sistem API Key** - Autentikasi perangkat yang aman
- **Tanpa Login** - Arsitektur self-hosted single-tenant
- **Environment Variables** - Manajemen konfigurasi yang aman
- **Validasi Input** - Mencegah SQL injection dan XSS

---

## 🚀 Instalasi

### Prasyarat

- **Node.js** 18+ atau **Bun** 1.0+
- **PostgreSQL** 14+ (atau SQLite untuk development)
- **Git**

### Mulai Cepat

```bash
# 1. Clone repository
git clone https://github.com/yourusername/FireGuardAI.git
cd FireGuardAI

# 2. Install dependencies
bun install
# atau
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# 4. Setup database
bunx prisma generate
bunx prisma migrate dev

# 5. (Opsional) Seed database dengan data contoh
bun run seed

# 6. Jalankan development server
bun run dev
# atau dengan logging ke file dev.log (cross-platform)
bun run dev:log

# 7. Buka browser
# http://localhost:3000
```

### Production Build

```bash
# Build untuk production (cross-platform)
bun run build

# Start production server
bun run start
# atau dengan logging ke file server.log (cross-platform)
bun run start:log

# Atau gunakan PM2 untuk process management
pm2 start "bun run start" --name fireguard
```

### 📝 Catatan Scripts

Proyek ini menggunakan **cross-platform scripts** yang bekerja di Windows, Mac, dan Linux:

- `bun run dev` - Jalankan development server (tanpa logging)
- `bun run dev:log` - Development server dengan logging ke `dev.log`
- `bun run build` - Build production (otomatis copy static files)
- `bun run start` - Jalankan production server (tanpa logging)
- `bun run start:log` - Production server dengan logging ke `server.log`

**Fitur Logging:**
- Log disimpan di file (`dev.log` atau `server.log`)
- Output tetap ditampilkan di terminal
- Cross-platform (menggunakan Node.js scripts, bukan Unix commands)

Lihat folder `scripts/` untuk detail implementasi.

---

## ⚙️ Konfigurasi

### Setup Database

FireGuardAI mendukung 3 pilihan database. Pilih yang sesuai dengan kebutuhan Anda:

> **📖 Dokumentasi Lengkap:** Lihat [DATABASE-SETUP.md](DATABASE-SETUP.md) untuk panduan detail setup database di Windows, Mac, dan Linux.

#### **Opsi 1: SQLite (Direkomendasikan untuk Development)** ✅

**Kelebihan:**
- ✅ Zero configuration - langsung jalan
- ✅ Tidak perlu install database server
- ✅ Perfect untuk development dan testing
- ✅ Data tersimpan di file lokal

**Setup:**

1. Copy file environment:
```bash
cp .env.example .env
```

2. Pastikan `DATABASE_URL` di `.env` menggunakan SQLite:
```env
DATABASE_URL="file:./prisma/db/custom.db"
```

3. Update `prisma/schema.prisma` - ubah provider ke `sqlite`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

4. Generate Prisma Client dan jalankan migrasi:
```bash
# Generate Prisma Client
bunx prisma generate

# Buat database dan tabel
bunx prisma migrate dev --name init

# (Opsional) Isi dengan data contoh
bun run seed
```

5. Verifikasi database:
```bash
# Buka Prisma Studio untuk melihat database
bunx prisma studio
# Akses: http://localhost:5555
```

**Catatan:** File database akan dibuat di `prisma/db/custom.db` (sudah di-gitignore).

---

#### **Opsi 2: PostgreSQL (Direkomendasikan untuk Production)** 🚀

**Kelebihan:**
- ✅ Performa lebih baik untuk production
- ✅ Mendukung concurrent connections
- ✅ Fitur database lengkap
- ✅ Cocok untuk deployment besar

**Setup:**

1. **Install PostgreSQL:**

   **Windows:**
   ```bash
   # Download dari: https://www.postgresql.org/download/windows/
   # Atau gunakan Chocolatey:
   choco install postgresql
   ```

   **Mac:**
   ```bash
   # Menggunakan Homebrew:
   brew install postgresql@15
   brew services start postgresql@15
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Buat Database:**

   ```bash
   # Login ke PostgreSQL
   # Windows: psql -U postgres
   # Mac/Linux: sudo -u postgres psql

   # Di psql prompt:
   CREATE DATABASE fireguard_ai;
   CREATE USER fireguard_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE fireguard_ai TO fireguard_user;
   \q
   ```

3. **Konfigurasi `.env`:**
   ```env
   DATABASE_URL="postgresql://fireguard_user:your_secure_password@localhost:5432/fireguard_ai"
   ```

4. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

5. **Jalankan Migrasi:**
   ```bash
   bunx prisma generate
   bunx prisma migrate deploy
   bun run seed  # Opsional
   ```

**Troubleshooting PostgreSQL:**

- **Koneksi ditolak**: Cek PostgreSQL service berjalan
  ```bash
  # Windows
  net start postgresql-x64-15

  # Mac
  brew services list

  # Linux
  sudo systemctl status postgresql
  ```

- **Authentication failed**: Cek username/password di `DATABASE_URL`
- **Database tidak ada**: Jalankan `CREATE DATABASE` seperti step 2

---

#### **Opsi 3: Supabase (Cloud PostgreSQL)** ☁️

**Kelebihan:**
- ✅ Free tier 500MB storage
- ✅ Managed database - no maintenance
- ✅ Built-in backups
- ✅ Akses dari mana saja
- ✅ Auto-scaling

**Setup:**

1. **Buat Account Supabase:**
   - Kunjungi [supabase.com](https://supabase.com)
   - Sign up gratis
   - Klik **New Project**

2. **Isi Detail Project:**
   - Name: `fireguard-ai`
   - Database Password: `your_secure_password` (simpan baik-baik!)
   - Region: Pilih yang terdekat (Singapore untuk Asia)
   - Pricing Plan: **Free**

3. **Dapatkan Connection String:**
   - Go to **Settings** → **Database**
   - Scroll ke **Connection String** → **URI**
   - Copy connection string (contoh):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```

4. **Konfigurasi `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:your_secure_password@db.abcdefghijk.supabase.co:5432/postgres"
   ```
   
   **⚠️ Ganti `[YOUR-PASSWORD]` dengan password yang Anda buat!**

5. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

6. **Jalankan Migrasi:**
   ```bash
   bunx prisma generate
   bunx prisma migrate deploy
   bun run seed  # Opsional
   ```

7. **Verifikasi di Supabase Dashboard:**
   - Go to **Table Editor**
   - Lihat tabel: `Device`, `SensorLog`, `Alert`, `SystemSettings`

**Tips Supabase:**
- ✅ Gunakan **Connection Pooling** untuk production (port 6543)
- ✅ Enable **Row Level Security (RLS)** untuk keamanan ekstra
- ✅ Monitoring usage di Dashboard → Settings → Usage
- ✅ Setup automatic backups di Settings → Database → Backups

---

### Perbandingan Database

| Fitur | SQLite | PostgreSQL | Supabase |
|-------|--------|------------|----------|
| **Setup** | ⭐⭐⭐⭐⭐ Instant | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Easy |
| **Performance** | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good |
| **Concurrent Users** | ⭐⭐ Limited | ⭐⭐⭐⭐⭐ Unlimited | ⭐⭐⭐⭐⭐ Unlimited |
| **Cost** | ✅ Free | ✅ Free (self-hosted) | ✅ Free (500MB) |
| **Maintenance** | ✅ Zero | ⚠️ Manual | ✅ Managed |
| **Backup** | Manual | Manual/Auto | ✅ Auto |
| **Remote Access** | ❌ No | ⚠️ Need config | ✅ Yes |
| **Best For** | Development | Production (VPS) | Production (Cloud) |

**Rekomendasi:**
- 🎓 **Tugas Kuliah/Demo**: SQLite
- 🏢 **Production (VPS)**: PostgreSQL
- ☁️ **Production (Cloud)**: Supabase
- 🚀 **Scaling**: Supabase atau PostgreSQL

---

### Environment Variables

Setelah memilih database, lengkapi konfigurasi di file `.env`:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Pilih salah satu:

# SQLite (Development)
DATABASE_URL="file:./prisma/db/custom.db"

# PostgreSQL (Production)
# DATABASE_URL="postgresql://fireguard_user:password@localhost:5432/fireguard_ai"

# Supabase (Cloud)
# DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# ============================================
# APPLICATION SETTINGS
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ============================================
# AI CHATBOT (OpenRouter)
# ============================================
OPENROUTER_API_KEY="sk-or-v1-your-api-key-here"
OPENROUTER_MODEL="google/gemini-flash-1.5-8b"
```

### Dapatkan OpenRouter API Key

1. Kunjungi [OpenRouter.ai](https://openrouter.ai/)
2. Sign up / Login
3. Navigasi ke [API Keys](https://openrouter.ai/keys)
4. Buat key baru
5. Copy dan paste ke `.env` → `OPENROUTER_API_KEY`

**Model Gratis yang Tersedia:**
- `google/gemini-flash-1.5-8b` (Direkomendasikan - cepat & berkualitas)
- `openai/gpt-oss-20b:free` (Open source GPT alternative)
- `meta-llama/llama-3.2-3b-instruct:free`
- `qwen/qwen-2-7b-instruct:free`
- `microsoft/phi-3-mini-128k-instruct:free`

---

### Perintah Database Prisma (Cross-Platform)

Semua perintah berikut bekerja di Windows, Mac, dan Linux:

```bash
# ====================================
# GENERATE PRISMA CLIENT
# ====================================

# Option 1: Safe generate (Recommended - Auto-retry dengan cleanup)
bun run db:generate:safe

# Option 2: Force generate (Hapus .prisma dulu, lalu generate)
bun run db:generate:force

# Option 3: Standard generate (Mungkin error jika dev server running)
bun run db:generate
# atau
bunx prisma generate

# ====================================
# DATABASE MIGRATION
# ====================================

# Buat migrasi baru (development)
bunx prisma migrate dev --name nama_migrasi

# Apply migrasi (production)
bunx prisma migrate deploy

# Reset database (hapus semua data + migrasi ulang)
bunx prisma migrate reset

# Check migration status
bunx prisma migrate status

# ====================================
# OTHER COMMANDS
# ====================================

# Isi database dengan data contoh
bun run seed

# Buka database browser (Prisma Studio)
bunx prisma studio

# Push schema tanpa migrasi (quick development)
bunx prisma db push

# Format schema file
bunx prisma format

# Validate schema
bunx prisma validate
```

**Tips:**
- ✅ **Selalu gunakan `db:generate:safe`** jika sering error EPERM
- ✅ Gunakan `migrate dev` saat development (membuat migration files)
- ✅ Gunakan `migrate deploy` di production (tanpa prompt)
- ✅ `db push` lebih cepat untuk prototyping (tidak create migration files)
- ⚠️ Selalu backup database sebelum `migrate reset`

**Jika Error EPERM (Windows):**
```bash
# Quick fix
taskkill /F /IM node.exe && taskkill /F /IM bun.exe && bun run db:generate:safe
```

---

## 🔧 Setup Hardware

### Konfigurasi ESP32

> **📖 Panduan Lengkap:** Lihat [firmware/ARDUINO-SETUP.md](firmware/ARDUINO-SETUP.md) untuk setup Arduino IDE, install libraries, dan troubleshooting lengkap.

#### 1. Install Arduino IDE & Libraries

**Quick Install:**
```
1. Download Arduino IDE: https://www.arduino.cc/en/software
2. Install ESP32 board support via Board Manager
3. Install library: ArduinoJson (v6.21.0+)
```

**Verify:**
- Board: ESP32 Dev Module tersedia
- Library: ArduinoJson muncul di Include Library
- Port: ESP32 terdeteksi

**📖 Detail:** [firmware/ARDUINO-SETUP.md](firmware/ARDUINO-SETUP.md)

---

#### 2. Konfigurasi Firmware

Buka `firmware/esp32_fire_monitor_complete/esp32_fire_monitor_complete.ino`

```cpp
// Konfigurasi WiFi
const char* ssid = "Your_WiFi_SSID";
const char* password = "Your_WiFi_Password";

// Konfigurasi Server
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/device/data";

// Konfigurasi Device
const char* deviceId = "IoTDevice-0x143000001";  // ID Unik
const char* apiKey = "fg_your_api_key_here";     // Dari dashboard

// Lokasi (Dapatkan dari Google Maps)
float latitude = -6.2088;   // Jakarta - Monas
float longitude = 106.8456;
```

**⚠️ PENTING:** Gunakan file `config.h` untuk keamanan!
```bash
cd firmware/esp32_fire_monitor_complete
cp config.h.example config.h
# Edit config.h (sudah di-gitignore)
```

**📖 Detail:** [firmware/esp32_fire_monitor_complete/README.md](firmware/esp32_fire_monitor_complete/README.md)

---

#### 3. Upload ke ESP32
1. Hubungkan ESP32 via USB
2. Pilih board: **ESP32 Dev Module**
3. Pilih port: **/dev/cu.usbserial-xxx** (Mac) atau **COM3** (Windows)
4. Klik **Upload** (Ctrl+U)
5. Buka **Serial Monitor** (115200 baud)

**Troubleshooting Upload:**
- **Library not found:** Install ArduinoJson via Library Manager
- **Port not found:** Install USB drivers (CP210x or CH340)
- **Upload failed:** Hold BOOT button during upload
- **Compilation error:** Check [firmware/ARDUINO-SETUP.md](firmware/ARDUINO-SETUP.md)

---

#### 4. Dapatkan API Key dari Dashboard
1. Buka dashboard FireGuardAI
2. Pergi ke halaman **Devices**
3. Klik **Add Device**
4. Isi nama dan ID perangkat
5. Klik **Add Device**
6. Klik card perangkat untuk membuka modal
7. Copy API key (klik ikon mata untuk menampilkan)
8. Paste ke firmware ESP32

### Wiring Hardware

#### Perangkat ESP32 (Sensor Suhu LM35)
```
Sensor LM35DZ:
- Pin 1 (VCC)  → ESP32 3.3V
- Pin 2 (VOUT) → ESP32 GPIO 35
- Pin 3 (GND)  → ESP32 GND

LED Indikator Hijau (NORMAL):
- Anode (+)  → ESP32 GPIO 25
- Cathode (-) → Resistor 220Ω → GND

LED Indikator Kuning (WARNING):
- Anode (+)  → ESP32 GPIO 26
- Cathode (-) → Resistor 220Ω → GND

LED Indikator Merah (DANGER):
- Anode (+)  → ESP32 GPIO 27
- Cathode (-) → Resistor 220Ω → GND
```

> **Catatan:** Firmware saat ini fokus pada **sensor suhu LM35** saja. Sensor api (flame) dan buzzer tidak digunakan dalam versi ini. LED akan berkedip sesuai status: Hijau (Normal), Kuning (Warning), Merah (Danger).

---

## 📱 Penggunaan

### Dashboard

#### 1. Lihat Semua Perangkat
- Navigasi ke **Dashboard**
- Lihat KPI card: Total perangkat, Online, Rata-rata suhu, Alert
- Lihat peta interaktif dengan semua lokasi perangkat
- Cek grafik riwayat suhu (24 jam)

#### 2. Manajemen Perangkat
- Pergi ke halaman **Devices**
- Klik **Add Device** untuk mendaftarkan perangkat baru
- Klik card perangkat untuk:
  - Lihat detail
  - Edit nama/lokasi
  - Copy API key
  - Hapus perangkat

#### 3. Alert
- Pergi ke halaman **Alerts**
- Lihat semua alert (resolved dan unresolved)
- Filter berdasarkan severity: Info, Warning, Critical
- Tandai alert sebagai resolved

### AI Chatbot

#### 1. Buka Chatbot
- Klik tombol **💬** di pojok kanan bawah
- Jendela chat terbuka

#### 2. Tanyakan Pertanyaan
```
✅ "Tampilkan status perangkat"
✅ "Berapa suhu di Jakarta?"
✅ "Ada alert hari ini?"
✅ "Tampilkan perangkat di Monas"
✅ "Perangkat saya tidak bisa connect, tolong bantu!"
```

#### 3. Fitur Chat
- **Refresh** (🔄): Mulai percakapan baru
- **Clear History** (🗑️): Hapus semua pesan
- **Auto-save**: Chat tersimpan selama 7 hari
- **Data Real-time**: AI menggunakan pembacaan sensor aktual

### Fitur Lokasi

#### 1. Tambah Perangkat dengan Lokasi
- Klik **Add Device**
- Isi nama dan ID perangkat
- Klik **Auto Detect** untuk lokasi saat ini
- Atau masukkan latitude/longitude secara manual
- Perangkat muncul di peta

#### 2. Lihat di Peta
- Dashboard menampilkan semua perangkat di peta
- Klik marker untuk melihat info perangkat
- Peta auto-zoom untuk menyesuaikan semua perangkat
- Dukungan dark mode

---

## 🔌 Dokumentasi API

### Base URL
```
http://localhost:3000/api
```

### Autentikasi
Semua endpoint perangkat memerlukan API key di request body:
```json
{
  "apiKey": "fg_your_api_key_here"
}
```

### Endpoint

#### 1. Kirim Data Sensor
```http
POST /api/device/data
Content-Type: application/json

{
  "apiKey": "fg_xxx",
  "deviceId": "IoTDevice-0x143000001",
  "temperature": 27.5,
  "humidity": 65.0,
  "flameDetected": false,
  "gasLevel": 0,
  "statusLevel": "normal"
}
```

**Status Sensor:**
- ✅ **temperature** - Sudah diimplementasikan penuh dan aktif
- 🚧 **humidity** - Dalam pengembangan (diterima tapi tidak ditampilkan)
- 🚧 **flameDetected** - Dalam pengembangan (diterima tapi tidak ditampilkan)
- 🚧 **gasLevel** - Dalam pengembangan (diterima tapi tidak ditampilkan)
- ✅ **statusLevel** - Sudah diimplementasikan penuh dan aktif

> **Catatan:** Saat ini, dashboard hanya menampilkan data **suhu**. Nilai sensor lain disimpan di database tetapi belum divisualisasikan di UI. Dukungan sensor lengkap akan hadir di v1.1.

#### 2. Dapatkan Semua Perangkat
```http
GET /api/devices
```

#### 3. Dapatkan Perangkat berdasarkan ID
```http
GET /api/devices/:id
```

#### 4. Buat Perangkat
```http
POST /api/devices
Content-Type: application/json

{
  "deviceId": "IoTDevice-0x143000001",
  "deviceName": "ESP32 - Monas",
  "location": "Jakarta - Monas",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

#### 5. Update Perangkat
```http
PUT /api/devices/:id
Content-Type: application/json

{
  "deviceName": "ESP32 - Updated",
  "location": "Lokasi Baru",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

#### 6. Hapus Perangkat
```http
DELETE /api/devices/:id
```

#### 7. Chat dengan AI
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Tampilkan status perangkat"
    }
  ],
  "includeContext": true
}
```

#### 8. Dapatkan Statistik Dashboard
```http
GET /api/dashboard/stats
```

#### 9. Dapatkan Alert
```http
GET /api/alerts
```

#### 10. Resolve Alert
```http
POST /api/alerts/:id/resolve
```

---

## 📊 Database Schema

### Device
```prisma
model Device {
  id          String   @id @default(cuid())
  deviceId    String   @unique
  deviceName  String
  apiKey      String   @unique
  location    String?
  latitude    Float?
  longitude   Float?
  status      String   @default("offline")
  lastSeen    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  sensorLogs  SensorLog[]
  alerts      Alert[]
}
```

### SensorLog
```prisma
model SensorLog {
  id            String   @id @default(cuid())
  deviceId      String
  temperature   Float?
  humidity      Float?
  flameDetected Boolean  @default(false)
  gasLevel      Float?
  statusLevel   String   @default("normal")
  createdAt     DateTime @default(now())
  device        Device   @relation(fields: [deviceId], references: [id])
}
```

### Alert
```prisma
model Alert {
  id        String   @id @default(cuid())
  deviceId  String
  message   String
  severity  String   @default("info")
  resolved  Boolean  @default(false)
  createdAt DateTime @default(now())
  device    Device   @relation(fields: [deviceId], references: [id])
}
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - Framework React dengan App Router
- **TypeScript** - Pengembangan type-safe
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Komponen UI yang indah
- **Framer Motion** - Animasi yang smooth
- **Leaflet** - Peta interaktif
- **Chart.js** - Visualisasi data
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database production
- **SQLite** - Database development

### AI & Layanan Eksternal
- **OpenRouter** - Akses model AI
- **OpenStreetMap** - Tile peta
- **Browser Geolocation API** - Deteksi lokasi

### IoT
- **ESP32** - Microcontroller
- **DHT22** - Sensor suhu/kelembaban
- **Flame Sensor** - Deteksi api
- **Arduino IDE** - Pengembangan firmware

---

## 📁 Struktur Proyek

```
FireGuardAI/
├── public/                    # Asset statis
│   ├── ESP32_1.png           # Foto perangkat
│   ├── ESP32_2.png
│   ├── AI_chatbot.png        # Screenshot
│   ├── Location Sensor.png
│   └── icon.svg              # Favicon & Icon
├── scripts/                  # Cross-platform helper scripts
│   ├── dev-with-log.js       # Dev server dengan logging
│   ├── start-with-log.js     # Production server dengan logging
│   ├── copy-build-files.js   # Copy static files (cross-platform)
│   └── README.md             # Dokumentasi scripts
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── chat/         # AI chatbot
│   │   │   ├── devices/      # Device CRUD
│   │   │   ├── device/data/  # IoT data ingestion
│   │   │   ├── alerts/       # Manajemen alert
│   │   │   └── dashboard/    # Statistik dashboard
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Halaman home
│   ├── components/           # Komponen React
│   │   ├── chat/             # UI AI chatbot
│   │   ├── dashboard/        # View dashboard
│   │   ├── devices/          # Manajemen perangkat
│   │   ├── maps/             # Komponen peta
│   │   ├── alerts/           # View alert
│   │   └── ui/               # Komponen shadcn/ui
│   ├── lib/                  # Utilities
│   │   ├── db.ts             # Prisma client
│   │   ├── openrouter.ts     # AI client
│   │   ├── coordinates.ts    # Utilitas GPS
│   │   └── utils.ts          # Fungsi helper
│   ├── stores/               # Zustand stores
│   │   └── app-store.ts      # State global
│   └── types/                # TypeScript types
│       └── index.ts
├── prisma/                   # Database
│   ├── schema.prisma         # Schema database
│   └── seed.ts               # Data seed
├── firmware/                 # Firmware ESP32
│   └── esp32_fire_monitor_complete/
│       ├── esp32_fire_monitor_complete.ino
│       ├── config.h          # Konfigurasi WiFi & API (gitignore)
│       ├── config.h.example  # Template konfigurasi
│       └── README.md         # Dokumentasi firmware
├── .env                      # Environment variables (gitignore)
├── .env.example              # Template environment
├── package.json              # Dependencies & cross-platform scripts
├── tsconfig.json             # Konfigurasi TypeScript
├── tailwind.config.ts        # Konfigurasi Tailwind
└── README.md                 # File ini
```

---

## 🔒 Keamanan

### Best Practices
- ✅ API key disimpan di environment variables
- ✅ Validasi input di semua endpoint
- ✅ Pencegahan SQL injection dengan Prisma
- ✅ Proteksi XSS dengan React
- ✅ HTTPS direkomendasikan untuk production
- ✅ Rate limiting direkomendasikan
- ✅ Konfigurasi CORS
- ✅ Database credentials di `.env` (gitignored)

### Rekomendasi
1. **Ubah kredensial default** di production
2. **Gunakan API key yang kuat** (auto-generated)
3. **Aktifkan HTTPS** dengan sertifikat SSL
4. **Setup firewall rules** di server
5. **Backup database secara berkala**
6. **Monitor penggunaan API**
7. **Update dependencies** secara berkala
8. **Gunakan PostgreSQL/Supabase** untuk production (bukan SQLite)
9. **Enable database connection pooling** untuk high traffic
10. **Rotate API keys** secara periodik

---

## 🐛 Troubleshooting

### Prisma Generate Issues (Windows)

#### Error: `EPERM: operation not permitted`

**Penyebab:** File `query_engine-windows.dll.node` sedang digunakan oleh process lain.

**Solusi Cepat:**

```bash
# 1. Stop semua dev servers (Ctrl+C di terminal)

# 2. Kill Node.js processes
taskkill /F /IM node.exe
taskkill /F /IM bun.exe

# 3. Gunakan safe generate script
bun run db:generate:safe

# Atau manual:
# Hapus folder .prisma
rmdir /s /q node_modules\.prisma
# Generate ulang
bunx prisma generate
```

**Pencegahan:**
- ⚠️ Jangan run `prisma generate` saat dev server berjalan
- ⚠️ Stop semua terminal yang menjalankan `bun run dev`
- ✅ Gunakan `bun run db:generate:safe` (auto-retry & cleanup)

---

### Database Issues

#### Error: `Environment variable not found: DATABASE_URL`

**Solusi:**
```bash
# Pastikan file .env ada
cp .env.example .env

# Edit .env dan set DATABASE_URL
# Contoh untuk SQLite:
# DATABASE_URL="file:./prisma/db/custom.db"
```

#### Error: `Can't reach database server`

**PostgreSQL:**
```bash
# Cek service PostgreSQL berjalan
# Windows
net start postgresql-x64-15

# Mac
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
sudo systemctl status postgresql
```

**Supabase:**
- Cek internet connection
- Verifikasi connection string di Supabase Dashboard
- Pastikan password benar (tanpa `[` `]`)

#### Error: `Database does not exist`

**PostgreSQL:**
```bash
# Buat database
createdb fireguard_ai

# Atau via psql:
psql -U postgres
CREATE DATABASE fireguard_ai;
\q
```

**SQLite/Supabase:** Jalankan migrasi:
```bash
bunx prisma migrate deploy
```

#### Error: `Prisma schema validation error`

**Solusi:**
```bash
# Format dan validate schema
bunx prisma format
bunx prisma validate

# Jika masih error, cek provider sesuai dengan DATABASE_URL
# SQLite → provider = "sqlite"
# PostgreSQL/Supabase → provider = "postgresql"
```

#### Error: `Migration failed`

**Solusi:**
```bash
# Reset database (HATI-HATI: Hapus semua data!)
bunx prisma migrate reset

# Atau rollback manual dan coba lagi
bunx prisma migrate resolve --rolled-back [migration_name]
bunx prisma migrate deploy
```

#### Database Terlalu Besar (SQLite)

**Solusi:**
```bash
# Hapus log lama (via Prisma Studio atau script)
bunx prisma studio

# Atau migrate ke PostgreSQL:
# 1. Export data
# 2. Update schema.prisma provider ke "postgresql"
# 3. Update DATABASE_URL
# 4. Import data
```

### Application Issues

#### Port 3000 Sudah Digunakan

**Solusi:**
```bash
# Ubah port di package.json atau jalankan dengan port lain
bun run dev -- -p 3001

# Atau kill process di port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

#### Dependencies Error

**Solusi:**
```bash
# Hapus node_modules dan reinstall
# Windows
rmdir /s /q node_modules
del bun.lock

# Mac/Linux
rm -rf node_modules
rm bun.lock

# Reinstall
bun install
```

#### Build Error

**Solusi:**
```bash
# Clean build artifacts
# Windows
rmdir /s /q .next

# Mac/Linux
rm -rf .next

# Rebuild
bun run build
```

### ESP32 Issues

Lihat [firmware/esp32_fire_monitor_complete/README.md](firmware/esp32_fire_monitor_complete/README.md) untuk troubleshooting hardware lengkap.

**Quick Fixes:**
- **WiFi tidak connect**: Cek SSID/password di `config.h`
- **Data tidak terkirim**: Cek server running dan API key benar
- **Sensor tidak akurat**: Lakukan kalibrasi sensor
- **LED tidak menyala**: Cek wiring dan resistor

---

## 🚀 Deployment

### Vercel (Direkomendasikan)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Tambahkan environment variables di dashboard Vercel
# - DATABASE_URL
# - OPENROUTER_API_KEY
# - NEXT_PUBLIC_APP_URL
```

### VPS / Self-Hosted

```bash
# 1. Clone repository di server
git clone https://github.com/yourusername/FireGuardAI.git
cd FireGuardAI

# 2. Install dependencies
bun install

# 3. Setup environment
cp .env.example .env
# Edit .env dengan nilai production

# 4. Setup database
bunx prisma generate
bunx prisma migrate deploy

# 5. Build
bun run build

# 6. Start dengan PM2
pm2 start "bun run start" --name fireguard
pm2 save
pm2 startup

# 7. Setup Nginx reverse proxy
# 8. Setup SSL dengan Let's Encrypt
```

### Docker (Segera Hadir)

```bash
# Build image
docker build -t fireguard-ai .

# Run container
docker run -p 3000:3000 --env-file .env fireguard-ai
```

---

## ⚠️ Keterbatasan Saat Ini

### Dukungan Sensor
Saat ini, FireGuardAI v1.0.0 fokus pada **monitoring suhu** sebagai sensor utama:

| Sensor | Dukungan API | Penyimpanan Database | Tampilan UI | Status |
|--------|-------------|---------------------|-------------|--------|
| 🌡️ Suhu | ✅ Ya | ✅ Ya | ✅ Ya | **Aktif** |
| 💧 Kelembaban | ✅ Ya | ✅ Ya | ❌ Tidak | Dalam Pengembangan |
| 🔥 Deteksi Api | ✅ Ya | ✅ Ya | ❌ Tidak | Dalam Pengembangan |
| 💨 Level Gas | ✅ Ya | ✅ Ya | ❌ Tidak | Dalam Pengembangan |

**Apa Artinya:**
- ✅ Anda dapat mengirim semua data sensor via API
- ✅ Semua data sensor disimpan di database
- ⚠️ Hanya suhu yang ditampilkan di dashboard dan grafik
- 🚧 Sensor lain akan divisualisasikan di v1.1

**Solusi Sementara:**
- Gunakan Prisma Studio untuk melihat semua data sensor: `bunx prisma studio`
- Query database secara langsung untuk data kelembaban, api, dan gas
- AI chatbot dapat mengakses semua data sensor (tersimpan tapi tidak divisualisasikan)

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan ikuti langkah-langkah berikut:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/FiturKeren`)
3. Commit perubahan (`git commit -m 'Tambah FiturKeren'`)
4. Push ke branch (`git push origin feature/FiturKeren`)
5. Buka Pull Request

### Panduan Pengembangan
- Ikuti best practices TypeScript
- Gunakan ESLint dan Prettier
- Tulis commit message yang bermakna
- Tambahkan test untuk fitur baru
- Update dokumentasi

---

## 📝 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

---

## 👥 Penulis

- **Your Name** - *Karya awal* - [GitHub](https://github.com/yourusername)

---

## 🙏 Ucapan Terima Kasih

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - Database ORM
- [OpenRouter](https://openrouter.ai/) - Akses model AI
- [shadcn/ui](https://ui.shadcn.com/) - Komponen UI
- [Leaflet](https://leafletjs.com/) - Peta interaktif
- [Chart.js](https://www.chartjs.org/) - Visualisasi data
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS

---

## 📞 Dukungan

### Dokumentasi
- [Panduan Setup Database](DATABASE-SETUP.md) - **Setup lengkap SQLite, PostgreSQL, dan Supabase**
- [Panduan Arduino IDE](firmware/ARDUINO-SETUP.md) - **Install Arduino IDE, ESP32, dan libraries**
- [Quick Start Guide](QUICK-START.md) - **Mulai dalam 5 menit**
- [Commands Cheat Sheet](COMMANDS-CHEATSHEET.md) - **Quick reference commands**
- [Panduan Setup](SETUP-GUIDE.md)
- [Fitur AI Chatbot](CHATBOT-FEATURES.md)
- [Panduan Sistem Koordinat](COORDINATE-SYSTEM-GUIDE.md)
- [Ringkasan Implementasi](IMPLEMENTATION-SUMMARY.md)
- [Cross-Platform Scripts](scripts/README.md) - **Dokumentasi helper scripts**

### Dapatkan Bantuan
- 📧 Email: support@fireguardai.com
- 💬 Discord: [Bergabung dengan komunitas kami](#)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/FireGuardAI/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/yourusername/FireGuardAI/wiki)

---

## 🗺️ Roadmap

### Versi 1.0.0 (Saat Ini) ✅
- ✅ Monitoring suhu real-time
- ✅ AI chatbot dengan data real
- ✅ Pelacakan lokasi
- ✅ Riwayat chat (7 hari)
- ✅ Dark mode
- ✅ Peta interaktif

### Versi 1.1 (Dalam Proses) 🚧
- 🚧 **Tampilan sensor kelembaban** - Visualisasi UI
- 🚧 **Tampilan deteksi api** - Integrasi alert
- 🚧 **Monitoring level gas** - Grafik dashboard
- [ ] Input suara untuk chatbot
- [ ] Export riwayat chat
- [ ] Dukungan multi-bahasa (ID/EN)
- [ ] Response AI streaming
- [ ] Push notification
- [ ] Email alert

### Versi 2.0 (Masa Depan) 📅
- [ ] Aplikasi mobile (React Native)
- [ ] Multi-tenant dengan autentikasi
- [ ] Analytics lanjutan
- [ ] Prediksi machine learning
- [ ] Integrasi bot Telegram
- [ ] SMS alert
- [ ] **Dashboard multi-sensor lengkap**

---

## 📊 Statistik

- **Baris Kode:** ~15,000+
- **Komponen:** 50+
- **API Endpoint:** 12
- **Tabel Database:** 3
- **Perangkat yang Didukung:** Unlimited
- **Bahasa:** TypeScript, C++ (Arduino)

---

<div align="center">

**Dibuat dengan ❤️ oleh Tim FireGuardAI**

⭐ Beri kami bintang di GitHub — sangat membantu!

[Website](#) • [Dokumentasi](#) • [Demo](#) • [Dukungan](#)

</div>
