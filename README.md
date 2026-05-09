# 🔥 FireGuardAI - IoT Fire Monitoring System

<div align="center">

![FireGuardAI - Location Sensor Mapping](public/Location%20Sensor.png)

**Smart Fire Detection & Monitoring System with AI Assistant**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*Real-time IoT monitoring with interactive maps, AI assistant, and ESP32 integration*

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Hardware Setup](#-hardware-setup) • [Usage](#-usage) • [API](#-api-documentation)

</div>

---

## 📖 Overview

FireGuardAI adalah sistem monitoring kebakaran berbasis IoT yang mengintegrasikan sensor ESP32 dengan dashboard web real-time dan AI assistant. Sistem ini dirancang untuk mendeteksi suhu tinggi, api, dan kondisi berbahaya lainnya, kemudian memberikan alert dan analisis melalui interface yang user-friendly.

### 🎯 Key Highlights

- ✅ **Real-time Monitoring** - Monitor suhu, kelembaban, dan deteksi api secara real-time
- 🤖 **AI Assistant** - Chatbot cerdas dengan OpenRouter untuk analisis dan troubleshooting
- 📍 **Location Tracking** - Pemetaan device dengan koordinat GPS (EPSG:4326/WGS 84)
- 📊 **Data Visualization** - Charts dan grafik untuk analisis trend
- 🔔 **Smart Alerts** - Notifikasi otomatis untuk kondisi berbahaya
- 🌐 **Multi-Database** - Support SQLite, PostgreSQL, dan Supabase
- 🔐 **API Key Authentication** - Keamanan device dengan API key
- 🎨 **Dark Mode** - Interface modern dengan dark mode support

---

## 🖼️ Demo

### 📱 ESP32 Devices

<div align="center">
<table>
<tr>
<td align="center">
<img src="public/ESP32_1.png" alt="ESP32 Device 1" width="400"/>
<br/>
<b>ESP32 Device #1</b>
<br/>
Temperature & Humidity Sensor
</td>
<td align="center">
<img src="public/ESP32_2.png" alt="ESP32 Device 2" width="400"/>
<br/>
<b>ESP32 Device #2</b>
<br/>
Flame Detection Sensor
</td>
</tr>
</table>
</div>

### 🤖 AI Chatbot Assistant

<div align="center">
<img src="public/AI_chatbot.png" alt="AI Chatbot" width="600"/>
<br/>
<b>AI Assistant with Real-time Data Integration</b>
<br/>
Ask questions, get insights, and troubleshoot issues
</div>

### 📍 Location Sensor Mapping

<div align="center">
<img src="public/Location Sensor.png" alt="Location Sensor" width="600"/>
<br/>
<b>Interactive Map with Device Locations</b>
<br/>
Track all devices with GPS coordinates (EPSG:4326)
</div>

---

## ✨ Features

### 🔥 Fire Detection & Monitoring
- **Temperature Monitoring** - Real-time temperature tracking with threshold alerts
- **Flame Detection** - Optical flame sensor integration
- **Gas Level Detection** - Monitor gas concentration levels
- **Humidity Tracking** - Environmental humidity monitoring
- **Status Levels** - Normal, Warning, Critical status indicators

### 🤖 AI-Powered Assistant
- **Real-time Data Analysis** - AI analyzes actual sensor data, not dummy data
- **Location-based Queries** - "Show me devices in Jakarta"
- **Troubleshooting Help** - Step-by-step guidance for issues
- **Chat History** - 7-day localStorage with auto-expire
- **Markdown Formatting** - Beautiful formatted responses with tables, lists, and emojis

### 📊 Dashboard & Analytics
- **Real-time KPI Cards** - Total devices, online status, average temperature, alerts
- **Interactive Map** - Leaflet map with device markers and popups
- **Temperature Charts** - 24-hour temperature history with Chart.js
- **Alert Frequency** - Visual alert trends over time
- **Device Management** - Add, edit, delete devices with modal interface

### 📍 Location Features
- **GPS Coordinates** - EPSG:4326 (WGS 84) standard
- **Auto-detect Location** - Browser geolocation API
- **Manual Input** - Latitude/longitude with validation
- **Map Integration** - OpenStreetMap with dark mode support
- **Distance Calculation** - Calculate distance between devices

### 🔐 Security & Authentication
- **API Key System** - Secure device authentication
- **No Login Required** - Self-hosted single-tenant architecture
- **Environment Variables** - Secure configuration management
- **Input Validation** - Prevent SQL injection and XSS

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **PostgreSQL** 14+ (or SQLite for development)
- **Git**

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/yourusername/FireGuardAI.git
cd FireGuardAI

# 2. Install dependencies
bun install
# or
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Setup database
bunx prisma generate
bunx prisma migrate dev

# 5. (Optional) Seed database with sample data
bunx prisma db seed

# 6. Run development server
bun run dev
# or
npm run dev

# 7. Open browser
# http://localhost:3000
```

### Production Build

```bash
# Build for production
bun run build

# Start production server
bun run start

# Or use PM2 for process management
pm2 start "bun run start" --name fireguard
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in root directory:

```env
# Database (choose one)
DATABASE_URL="postgresql://user:password@localhost:5432/fireguard_ai_db"
# or SQLite for development
# DATABASE_URL="file:./prisma/db/custom.db"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# AI Chatbot (OpenRouter)
OPENROUTER_API_KEY="sk-or-v1-your-api-key-here"
OPENROUTER_MODEL="google/gemini-flash-1.5-8b"
```

### Get OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up / Login
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create new key
5. Copy and paste to `.env`

**Free Models Available:**
- `google/gemini-flash-1.5-8b` (Recommended)
- `meta-llama/llama-3.2-3b-instruct:free`
- `qwen/qwen-2-7b-instruct:free`
- `microsoft/phi-3-mini-128k-instruct:free`

---

## 🔧 Hardware Setup

### ESP32 Configuration

#### 1. Install Arduino IDE
- Download from [arduino.cc](https://www.arduino.cc/en/software)
- Install ESP32 board support

#### 2. Install Required Libraries
```
- WiFi.h (built-in)
- HTTPClient.h (built-in)
- ArduinoJson (Library Manager)
- DHT sensor library (for temperature/humidity)
```

#### 3. Configure Firmware

Open `firmware/esp32_fire_monitor_complete/esp32_fire_monitor_complete.ino`

```cpp
// WiFi Configuration
const char* ssid = "Your_WiFi_SSID";
const char* password = "Your_WiFi_Password";

// Server Configuration
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/device/data";

// Device Configuration
const char* deviceId = "IoTDevice-0x143000001";  // Unique ID
const char* apiKey = "fg_your_api_key_here";     // From dashboard

// Location (Get from Google Maps)
float latitude = -6.2088;   // Jakarta - Monas
float longitude = 106.8456;
```

#### 4. Upload to ESP32
1. Connect ESP32 via USB
2. Select board: **ESP32 Dev Module**
3. Select port: **/dev/cu.usbserial-xxx** (Mac) or **COM3** (Windows)
4. Click **Upload**
5. Open **Serial Monitor** (115200 baud)

#### 5. Get API Key from Dashboard
1. Open FireGuardAI dashboard
2. Go to **Devices** page
3. Click **Add Device**
4. Fill device name and ID
5. Click **Add Device**
6. Click device card to open modal
7. Copy API key (click eye icon to show)
8. Paste to ESP32 firmware

### Hardware Wiring

#### ESP32 Device #1 (Temperature & Humidity)
```
DHT22 Sensor:
- VCC  → 3.3V
- GND  → GND
- DATA → GPIO 4

LED Indicator:
- Anode  → GPIO 2
- Cathode → GND (with 220Ω resistor)
```

#### ESP32 Device #2 (Flame Detection)
```
Flame Sensor:
- VCC → 5V
- GND → GND
- DO  → GPIO 5

Buzzer (optional):
- Positive → GPIO 18
- Negative → GND
```

---

## 📱 Usage

### Dashboard

#### 1. View All Devices
- Navigate to **Dashboard**
- See KPI cards: Total devices, Online, Avg temperature, Alerts
- View interactive map with all device locations
- Check temperature history chart (24 hours)

#### 2. Device Management
- Go to **Devices** page
- Click **Add Device** to register new device
- Click device card to:
  - View details
  - Edit name/location
  - Copy API key
  - Delete device

#### 3. Alerts
- Go to **Alerts** page
- View all alerts (resolved and unresolved)
- Filter by severity: Info, Warning, Critical
- Mark alerts as resolved

### AI Chatbot

#### 1. Open Chatbot
- Click **💬** button at bottom-right corner
- Chat window opens

#### 2. Ask Questions
```
✅ "Show me device status"
✅ "What's the temperature in Jakarta?"
✅ "Any alerts today?"
✅ "Show me devices in Monas"
✅ "My device won't connect, help!"
```

#### 3. Chat Features
- **Refresh** (🔄): Start new conversation
- **Clear History** (🗑️): Delete all messages
- **Auto-save**: Chat saved for 7 days
- **Real-time Data**: AI uses actual sensor readings

### Location Features

#### 1. Add Device with Location
- Click **Add Device**
- Fill device name and ID
- Click **Auto Detect** for current location
- Or enter latitude/longitude manually
- Device appears on map

#### 2. View on Map
- Dashboard shows all devices on map
- Click marker to see device info
- Map auto-zooms to fit all devices
- Dark mode support

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All device endpoints require API key in request body:
```json
{
  "apiKey": "fg_your_api_key_here"
}
```

### Endpoints

#### 1. Send Sensor Data
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

#### 2. Get All Devices
```http
GET /api/devices
```

#### 3. Get Device by ID
```http
GET /api/devices/:id
```

#### 4. Create Device
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

#### 5. Update Device
```http
PUT /api/devices/:id
Content-Type: application/json

{
  "deviceName": "ESP32 - Updated",
  "location": "New Location",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

#### 6. Delete Device
```http
DELETE /api/devices/:id
```

#### 7. Chat with AI
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Show me device status"
    }
  ],
  "includeContext": true
}
```

#### 8. Get Dashboard Stats
```http
GET /api/dashboard/stats
```

#### 9. Get Alerts
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
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Smooth animations
- **Leaflet** - Interactive maps
- **Chart.js** - Data visualization
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Production database
- **SQLite** - Development database

### AI & External Services
- **OpenRouter** - AI model access
- **OpenStreetMap** - Map tiles
- **Browser Geolocation API** - Location detection

### IoT
- **ESP32** - Microcontroller
- **DHT22** - Temperature/humidity sensor
- **Flame Sensor** - Fire detection
- **Arduino IDE** - Firmware development

---

## 📁 Project Structure

```
FireGuardAI/
├── public/                    # Static assets
│   ├── ESP32_1.png           # Device photos
│   ├── ESP32_2.png
│   ├── AI_chatbot.png        # Screenshots
│   ├── Location Sensor.png
│   └── icon.svg              # Favicon & Icon
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── chat/         # AI chatbot
│   │   │   ├── devices/      # Device CRUD
│   │   │   ├── device/data/  # IoT data ingestion
│   │   │   ├── alerts/       # Alert management
│   │   │   └── dashboard/    # Dashboard stats
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── chat/             # AI chatbot UI
│   │   ├── dashboard/        # Dashboard views
│   │   ├── devices/          # Device management
│   │   ├── maps/             # Map components
│   │   ├── alerts/           # Alert views
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utilities
│   │   ├── db.ts             # Prisma client
│   │   ├── openrouter.ts     # AI client
│   │   ├── coordinates.ts    # GPS utilities
│   │   └── utils.ts          # Helper functions
│   ├── stores/               # Zustand stores
│   │   └── app-store.ts      # Global state
│   └── types/                # TypeScript types
│       └── index.ts
├── prisma/                   # Database
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── firmware/                 # ESP32 firmware
│   └── esp32_fire_monitor_complete/
│       └── esp32_fire_monitor_complete.ino
├── .env                      # Environment variables
├── .env.example              # Environment template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
└── README.md                 # This file
```

---

## 🔒 Security

### Best Practices
- ✅ API keys stored in environment variables
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention with Prisma
- ✅ XSS protection with React
- ✅ HTTPS recommended for production
- ✅ Rate limiting recommended
- ✅ CORS configuration

### Recommendations
1. **Change default credentials** in production
2. **Use strong API keys** (auto-generated)
3. **Enable HTTPS** with SSL certificate
4. **Set up firewall rules** on server
5. **Regular database backups**
6. **Monitor API usage**
7. **Update dependencies** regularly

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Add environment variables in Vercel dashboard
# - DATABASE_URL
# - OPENROUTER_API_KEY
# - NEXT_PUBLIC_APP_URL
```

### VPS / Self-Hosted

```bash
# 1. Clone repository on server
git clone https://github.com/yourusername/FireGuardAI.git
cd FireGuardAI

# 2. Install dependencies
bun install

# 3. Setup environment
cp .env.example .env
# Edit .env with production values

# 4. Setup database
bunx prisma generate
bunx prisma migrate deploy

# 5. Build
bun run build

# 6. Start with PM2
pm2 start "bun run start" --name fireguard
pm2 save
pm2 startup

# 7. Setup Nginx reverse proxy
# 8. Setup SSL with Let's Encrypt
```

### Docker (Coming Soon)

```bash
# Build image
docker build -t fireguard-ai .

# Run container
docker run -p 3000:3000 --env-file .env fireguard-ai
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [OpenRouter](https://openrouter.ai/) - AI model access
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

## 📞 Support

### Documentation
- [Setup Guide](SETUP-GUIDE.md)
- [AI Chatbot Features](CHATBOT-FEATURES.md)
- [Coordinate System Guide](COORDINATE-SYSTEM-GUIDE.md)
- [Implementation Summary](IMPLEMENTATION-SUMMARY.md)

### Get Help
- 📧 Email: support@fireguardai.com
- 💬 Discord: [Join our community](#)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/FireGuardAI/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/yourusername/FireGuardAI/wiki)

---

## 🗺️ Roadmap

### Version 2.0 (Current)
- ✅ Real-time monitoring
- ✅ AI chatbot with real data
- ✅ Location tracking
- ✅ Chat history (7 days)
- ✅ Dark mode

### Version 2.1 (Planned)
- [ ] Voice input for chatbot
- [ ] Export chat history
- [ ] Multi-language support (ID/EN)
- [ ] Streaming AI responses
- [ ] Push notifications
- [ ] Email alerts

### Version 3.0 (Future)
- [ ] Mobile app (React Native)
- [ ] Multi-tenant with authentication
- [ ] Advanced analytics
- [ ] Machine learning predictions
- [ ] Telegram bot integration
- [ ] SMS alerts

---

## 📊 Statistics

- **Lines of Code:** ~15,000+
- **Components:** 50+
- **API Endpoints:** 12
- **Database Tables:** 3
- **Supported Devices:** Unlimited
- **Languages:** TypeScript, C++ (Arduino)

---

<div align="center">

**Made with ❤️ by FireGuardAI Team**

⭐ Star us on GitHub — it helps!

[Website](#) • [Documentation](#) • [Demo](#) • [Support](#)

</div>
