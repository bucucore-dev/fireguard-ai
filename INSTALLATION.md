# 📦 FireGuardAI - Complete Installation Guide

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Software Installation](#software-installation)
3. [Database Setup](#database-setup)
4. [Application Setup](#application-setup)
5. [ESP32 Hardware Setup](#esp32-hardware-setup)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

### Minimum Requirements
- **OS:** Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM:** 4 GB
- **Storage:** 2 GB free space
- **Node.js:** 18.0.0 or higher
- **Database:** PostgreSQL 14+ or SQLite

### Recommended Requirements
- **OS:** macOS 12+ or Ubuntu 22.04+
- **RAM:** 8 GB or more
- **Storage:** 5 GB free space
- **Node.js:** 20.0.0 or higher
- **Database:** PostgreSQL 15+

---

## 💻 Software Installation

### 1. Install Node.js / Bun

#### Option A: Bun (Recommended - Faster)

**macOS / Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify installation:
```bash
bun --version
```

#### Option B: Node.js

Download from [nodejs.org](https://nodejs.org/) and install.

Verify installation:
```bash
node --version
npm --version
```

### 2. Install PostgreSQL (Production)

#### macOS (Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows:
Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)

### 3. Install Git

#### macOS:
```bash
brew install git
```

#### Ubuntu/Debian:
```bash
sudo apt install git
```

#### Windows:
Download from [git-scm.com](https://git-scm.com/download/win)

### 4. Install Arduino IDE (for ESP32)

Download from [arduino.cc](https://www.arduino.cc/en/software)

**Add ESP32 Board Support:**
1. Open Arduino IDE
2. Go to **File → Preferences**
3. Add to **Additional Board Manager URLs:**
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to **Tools → Board → Boards Manager**
5. Search "ESP32" and install **esp32 by Espressif Systems**

---

## 🗄️ Database Setup

### Option 1: PostgreSQL (Production)

#### 1. Create Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fireguard_ai_db;

# Create user (optional)
CREATE USER fireguard WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fireguard_ai_db TO fireguard;

# Exit
\q
```

#### 2. Update .env
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/fireguard_ai_db?schema=public"
```

### Option 2: SQLite (Development)

No setup required! Just use:
```env
DATABASE_URL="file:./prisma/db/custom.db"
```

---

## 🚀 Application Setup

### 1. Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/yourusername/FireGuardAI.git

# Navigate to directory
cd FireGuardAI
```

### 2. Install Dependencies

```bash
# Using Bun (faster)
bun install

# Or using npm
npm install
```

### 3. Setup Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env file
nano .env
# or
code .env
```

**Required variables:**
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/fireguard_ai_db"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# AI Chatbot
OPENROUTER_API_KEY="sk-or-v1-your-api-key-here"
OPENROUTER_MODEL="google/gemini-flash-1.5-8b"
```

### 4. Get OpenRouter API Key

1. Go to [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up / Login
3. Navigate to [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. Click **"Create Key"**
5. Copy the API key
6. Paste to `.env` file

**Free models available:**
- `google/gemini-flash-1.5-8b` ✅ Recommended
- `meta-llama/llama-3.2-3b-instruct:free`
- `qwen/qwen-2-7b-instruct:free`
- `microsoft/phi-3-mini-128k-instruct:free`

### 5. Setup Database Schema

```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate dev

# (Optional) Seed with sample data
bunx prisma db seed
```

### 6. Verify Setup

```bash
# Open Prisma Studio to view database
bunx prisma studio
```

Browser will open at `http://localhost:5555`

---

## 🔧 ESP32 Hardware Setup

### Required Components

#### ESP32 Device #1 (Temperature & Humidity)
- 1x ESP32 Dev Board
- 1x DHT22 Temperature/Humidity Sensor
- 1x LED (any color)
- 1x 220Ω Resistor
- Jumper wires
- Breadboard

#### ESP32 Device #2 (Flame Detection)
- 1x ESP32 Dev Board
- 1x Flame Sensor Module
- 1x Buzzer (optional)
- Jumper wires
- Breadboard

### Wiring Diagram

#### Device #1: Temperature & Humidity
```
DHT22 Sensor:
┌─────────┐
│  DHT22  │
│         │
│ VCC  ●──┼─→ ESP32 3.3V
│ DATA ●──┼─→ ESP32 GPIO 4
│ GND  ●──┼─→ ESP32 GND
└─────────┘

LED Indicator:
LED Anode (+) → GPIO 2
LED Cathode (-) → 220Ω Resistor → GND
```

#### Device #2: Flame Detection
```
Flame Sensor:
┌──────────────┐
│ Flame Sensor │
│              │
│ VCC  ●───────┼─→ ESP32 5V
│ GND  ●───────┼─→ ESP32 GND
│ DO   ●───────┼─→ ESP32 GPIO 5
└──────────────┘

Buzzer (Optional):
Buzzer (+) → GPIO 18
Buzzer (-) → GND
```

### Install Arduino Libraries

1. Open Arduino IDE
2. Go to **Sketch → Include Library → Manage Libraries**
3. Install these libraries:
   - **DHT sensor library** by Adafruit
   - **Adafruit Unified Sensor** by Adafruit
   - **ArduinoJson** by Benoit Blanchon

### Upload Firmware

#### 1. Open Firmware File
```bash
# Navigate to firmware directory
cd firmware/esp32_fire_monitor_complete

# Open in Arduino IDE
open esp32_fire_monitor_complete.ino
```

#### 2. Configure WiFi & Server

Edit these lines in the firmware:
```cpp
// WiFi Configuration
const char* ssid = "Your_WiFi_SSID";        // Change this
const char* password = "Your_WiFi_Password"; // Change this

// Server Configuration
const char* serverUrl = "http://192.168.1.100:3000/api/device/data"; // Change IP

// Device Configuration
const char* deviceId = "IoTDevice-0x143000001";  // Unique ID
const char* apiKey = "fg_your_api_key_here";     // Get from dashboard

// Location (from Google Maps)
float latitude = -6.2088;   // Your latitude
float longitude = 106.8456; // Your longitude
```

#### 3. Select Board & Port

1. **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
2. **Tools → Port → /dev/cu.usbserial-xxx** (Mac) or **COM3** (Windows)
3. **Tools → Upload Speed → 115200**

#### 4. Upload

1. Click **Upload** button (→)
2. Wait for "Done uploading"
3. Open **Serial Monitor** (Ctrl+Shift+M)
4. Set baud rate to **115200**

#### 5. Verify Connection

Serial Monitor should show:
```
Connecting to WiFi...
WiFi connected!
IP address: 192.168.1.xxx
Sending data to server...
Response: 200 OK
```

---

## ⚙️ Configuration

### Get API Key from Dashboard

1. Start the application (see next section)
2. Open browser: `http://localhost:3000`
3. Go to **Devices** page
4. Click **Add Device** button
5. Fill in:
   - **Device Name:** ESP32 - Monas
   - **Device ID:** IoTDevice-0x143000001
   - **Location:** Jakarta - Monas
   - **Latitude:** -6.2088
   - **Longitude:** 106.8456
6. Click **Add Device**
7. Click the device card to open modal
8. Click **eye icon** to show API key
9. Click **copy icon** to copy API key
10. Paste to ESP32 firmware

### Get Coordinates from Google Maps

1. Open [Google Maps](https://maps.google.com)
2. Right-click on location
3. Click on coordinates (will auto-copy)
4. Format: `-6.2088, 106.8456`
   - First number = Latitude
   - Second number = Longitude

---

## 🏃 Running the Application

### Development Mode

```bash
# Start development server
bun run dev

# Or with npm
npm run dev
```

Open browser: `http://localhost:3000`

### Production Mode

```bash
# Build for production
bun run build

# Start production server
bun run start
```

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start "bun run start" --name fireguard

# View logs
pm2 logs fireguard

# Stop application
pm2 stop fireguard

# Restart application
pm2 restart fireguard

# Auto-start on system boot
pm2 startup
pm2 save
```

### Database Management

```bash
# Open Prisma Studio (GUI)
bunx prisma studio

# View database
# http://localhost:5555

# Run migrations
bunx prisma migrate dev

# Reset database (WARNING: deletes all data)
bunx prisma migrate reset

# Generate Prisma client
bunx prisma generate
```

---

## 🐛 Troubleshooting

### Issue 1: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
bun run dev -- -p 3001
```

### Issue 2: Database connection failed

**Solution:**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql@15

# Test connection
psql -U postgres -d fireguard_ai_db
```

### Issue 3: Prisma client not generated

**Solution:**
```bash
# Generate Prisma client
bunx prisma generate

# If still fails, delete and regenerate
rm -rf node_modules/.prisma
bunx prisma generate
```

### Issue 4: ESP32 won't connect to WiFi

**Solution:**
1. Check WiFi credentials in firmware
2. Ensure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
3. Check WiFi signal strength
4. Open Serial Monitor to see error messages
5. Try different WiFi network

### Issue 5: ESP32 can't reach server

**Solution:**
1. Check server IP address
2. Ensure server is running
3. Check firewall settings
4. Try `ping` from ESP32 network
5. Use local IP (192.168.x.x) not localhost

### Issue 6: API key invalid

**Solution:**
1. Verify API key copied correctly
2. Check for extra spaces
3. Regenerate API key from dashboard
4. Ensure device exists in database

### Issue 7: AI chatbot not responding

**Solution:**
1. Check OPENROUTER_API_KEY in .env
2. Verify API key is valid at openrouter.ai
3. Check browser console for errors
4. Restart development server
5. Clear browser cache

### Issue 8: Map not showing devices

**Solution:**
1. Check latitude/longitude are filled
2. Verify coordinates are valid (-90 to 90, -180 to 180)
3. Check coordinates not swapped
4. Refresh page
5. Check browser console for errors

---

## 📊 Verification Checklist

### Application
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] Development server running
- [ ] Can access http://localhost:3000
- [ ] Dashboard loads correctly
- [ ] Can add device
- [ ] Can view devices on map

### ESP32
- [ ] Arduino IDE installed
- [ ] ESP32 board support added
- [ ] Libraries installed
- [ ] Firmware uploaded successfully
- [ ] Serial Monitor shows WiFi connected
- [ ] Serial Monitor shows data sent
- [ ] Device appears online in dashboard
- [ ] Temperature data showing

### AI Chatbot
- [ ] OpenRouter API key configured
- [ ] Chat button visible (bottom-right)
- [ ] Can open chat window
- [ ] Can send message
- [ ] AI responds with real data
- [ ] Chat history saves

---

## 🎉 Success!

If all checks pass, your FireGuardAI system is ready!

### Next Steps:
1. Add more ESP32 devices
2. Configure alert thresholds
3. Explore AI chatbot features
4. Set up production deployment
5. Configure email/SMS alerts

### Need Help?
- 📖 Read [README.md](README.md)
- 💬 Check [CHATBOT-FEATURES.md](CHATBOT-FEATURES.md)
- 🗺️ See [COORDINATE-SYSTEM-GUIDE.md](COORDINATE-SYSTEM-GUIDE.md)
- 🐛 Open [GitHub Issue](https://github.com/yourusername/FireGuardAI/issues)

---

**Happy Monitoring! 🔥🚒**
