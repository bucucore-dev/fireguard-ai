# 🔥 FireGuardAI - Sistem Monitoring Kebakaran IoT

<div align="center">

![FireGuardAI - Pemetaan Lokasi Sensor](public/Location%20Sensor.png)

**Sistem Deteksi & Monitoring Kebakaran Cerdas dengan AI Assistant**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*Monitoring IoT real-time dengan peta interaktif, AI assistant, dan integrasi ESP32*

[Fitur](#-fitur) • [Demo](#-demo) • [Instalasi](#-instalasi) • [Setup Hardware](#-setup-hardware) • [Penggunaan](#-penggunaan) • [Dokumentasi API](#-dokumentasi-api)

</div>

---

## 📖 Ringkasan

FireGuardAI adalah sistem monitoring kebakaran berbasis IoT yang mengintegrasikan sensor ESP32 dengan dashboard web real-time dan AI assistant. Sistem ini dirancang untuk mendeteksi suhu tinggi, api, dan kondisi berbahaya lainnya, kemudian memberikan alert dan analisis melalui interface yang user-friendly.

> **🚧 Status Pengembangan:** Saat ini sistem fokus pada **monitoring suhu (temperature)** sebagai sensor utama. Sensor lain seperti flame detection, gas level, dan humidity masih dalam tahap pengembangan dan akan ditambahkan di versi mendatang.

### 🎯 Fitur Utama

- ✅ **Monitoring Real-time** - Monitor suhu, kelembaban, dan deteksi api secara real-time
- 🤖 **AI Assistant** - Chatbot cerdas dengan OpenRouter untuk analisis dan troubleshooting
- 📍 **Pelacakan Lokasi** - Pemetaan perangkat dengan koordinat GPS (EPSG:4326/WGS 84)
- 📊 **Visualisasi Data** - Grafik dan chart untuk analisis trend
- 🔔 **Alert Cerdas** - Notifikasi otomatis untuk kondisi berbahaya
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
<img src="public/ESP32_1.png" alt="ESP32 Device 1" width="400"/>
<br/>
<b>Perangkat ESP32 #1</b>
<br/>
Sensor Suhu & Kelembaban
</td>
<td align="center">
<img src="public/ESP32_2.png" alt="ESP32 Device 2" width="400"/>
<br/>
<b>Perangkat ESP32 #2</b>
<br/>
Sensor Deteksi Api
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
- **Deteksi Api** - Integrasi sensor api optik 🚧 **Dalam Pengembangan**
- **Deteksi Level Gas** - Monitor tingkat konsentrasi gas 🚧 **Dalam Pengembangan**
- **Pelacakan Kelembaban** - Monitoring kelembaban lingkungan 🚧 **Dalam Pengembangan**
- **Level Status** - Indikator status Normal, Warning, Critical ✅ **Aktif**

> **Catatan:** Saat ini, hanya **sensor suhu** yang sudah sepenuhnya diimplementasikan dan menampilkan data. Sensor lain (api, gas, kelembaban) masih dalam tahap pengembangan dan akan tersedia di update mendatang.

### 🤖 AI-Powered Assistant
- **Analisis Data Real-time** - AI menganalisis data sensor aktual, bukan data dummy
- **Query Berbasis Lokasi** - "Tampilkan perangkat di Jakarta"
- **Bantuan Troubleshooting** - Panduan langkah demi langkah untuk masalah
- **Riwayat Chat** - localStorage 7 hari dengan auto-expire
- **Format Markdown** - Response terformat indah dengan tabel, list, dan emoji

### 📊 Dashboard & Analytics
- **KPI Card Real-time** - Total perangkat, status online, rata-rata suhu, alert
- **Peta Interaktif** - Peta Leaflet dengan marker dan popup perangkat
- **Grafik Suhu** - Riwayat suhu 24 jam dengan Chart.js
- **Frekuensi Alert** - Trend alert visual dari waktu ke waktu
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
bunx prisma db seed

# 6. Jalankan development server
bun run dev
# atau
npm run dev

# 7. Buka browser
# http://localhost:3000
```

### Production Build

```bash
# Build untuk production
bun run build

# Start production server
bun run start

# Atau gunakan PM2 untuk process management
pm2 start "bun run start" --name fireguard
```

---

## ⚙️ Konfigurasi

### Environment Variables

Buat file `.env` di root directory:

```env
# Database (pilih salah satu)
DATABASE_URL="postgresql://user:password@localhost:5432/fireguard_ai_db"
# atau SQLite untuk development
# DATABASE_URL="file:./prisma/db/custom.db"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# AI Chatbot (OpenRouter)
OPENROUTER_API_KEY="sk-or-v1-your-api-key-here"
OPENROUTER_MODEL="google/gemini-flash-1.5-8b"
```

### Dapatkan OpenRouter API Key

1. Kunjungi [OpenRouter.ai](https://openrouter.ai/)
2. Sign up / Login
3. Navigasi ke [API Keys](https://openrouter.ai/keys)
4. Buat key baru
5. Copy dan paste ke `.env`

**Model Gratis yang Tersedia:**
- `google/gemini-flash-1.5-8b` (Direkomendasikan)
- `meta-llama/llama-3.2-3b-instruct:free`
- `qwen/qwen-2-7b-instruct:free`
- `microsoft/phi-3-mini-128k-instruct:free`

---

## 🔧 Setup Hardware

### Konfigurasi ESP32

#### 1. Install Arduino IDE
- Download dari [arduino.cc](https://www.arduino.cc/en/software)
- Install dukungan board ESP32

#### 2. Install Library yang Diperlukan
```
- WiFi.h (built-in)
- HTTPClient.h (built-in)
- ArduinoJson (Library Manager)
- DHT sensor library (untuk suhu/kelembaban)
```

#### 3. Konfigurasi Firmware

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

#### 4. Upload ke ESP32
1. Hubungkan ESP32 via USB
2. Pilih board: **ESP32 Dev Module**
3. Pilih port: **/dev/cu.usbserial-xxx** (Mac) atau **COM3** (Windows)
4. Klik **Upload**
5. Buka **Serial Monitor** (115200 baud)

#### 5. Dapatkan API Key dari Dashboard
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
│       └── esp32_fire_monitor_complete.ino
├── .env                      # Environment variables
├── .env.example              # Template environment
├── package.json              # Dependencies
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

### Rekomendasi
1. **Ubah kredensial default** di production
2. **Gunakan API key yang kuat** (auto-generated)
3. **Aktifkan HTTPS** dengan sertifikat SSL
4. **Setup firewall rules** di server
5. **Backup database secara berkala**
6. **Monitor penggunaan API**
7. **Update dependencies** secara berkala

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
- [Panduan Setup](SETUP-GUIDE.md)
- [Fitur AI Chatbot](CHATBOT-FEATURES.md)
- [Panduan Sistem Koordinat](COORDINATE-SYSTEM-GUIDE.md)
- [Ringkasan Implementasi](IMPLEMENTATION-SUMMARY.md)

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
