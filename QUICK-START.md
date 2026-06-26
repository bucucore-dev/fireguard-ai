# 🚀 Quick Start Guide - FireGuardAI

Panduan cepat untuk mulai development dalam **5 menit**!

---

## ⚡ Super Quick (TL;DR)

```bash
# 1. Clone & Install
git clone <repo-url>
cd fireguard-ai
bun install

# 2. Setup Environment
cp .env.example .env

# 3. Setup Database (SQLite - zero config)
bun run db:generate:safe
bunx prisma migrate dev

# 4. Run Development Server
bun run dev

# 5. Buka Browser
# http://localhost:3000
```

**🎉 Done! Dashboard sudah berjalan.**

---

## 📋 Langkah Detail

### Step 1: Prerequisites

**Install Requirements:**
- ✅ [Bun](https://bun.sh) atau [Node.js 18+](https://nodejs.org)
- ✅ [Git](https://git-scm.com)
- ✅ Text Editor (VS Code recommended)

**Verify Installation:**
```bash
bun --version   # atau: node --version
git --version
```

---

### Step 2: Clone Repository

```bash
git clone https://github.com/yourusername/fireguard-ai.git
cd fireguard-ai
```

---

### Step 3: Install Dependencies

```bash
bun install
# Atau jika pakai npm:
# npm install
```

**Waktu: ~30 detik**

---

### Step 4: Setup Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit .env (optional - defaults sudah OK untuk development)
# DATABASE_URL sudah set ke SQLite
# OPENROUTER_API_KEY opsional (untuk AI chatbot)
```

**File `.env` minimal:**
```env
DATABASE_URL="file:./prisma/db/custom.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

### Step 5: Setup Database

**Recommended (Safe):**
```bash
# Auto-detect package manager & handle errors
bun run db:generate:safe

# Create database tables
bunx prisma migrate dev --name init
```

**Alternative (Force Clean):**
```bash
# Force clean .prisma folder first
bun run db:generate:force

# Create database tables
bunx prisma migrate dev --name init
```

**Manual (If needed):**
```bash
# Standard generate
bunx prisma generate

# Create database tables
bunx prisma migrate dev --name init
```

**⚠️ Jika Error EPERM di Windows:**
```bash
# One-liner fix
taskkill /F /IM node.exe & taskkill /F /IM bun.exe & bun run db:generate:safe

# Or step by step:
# 1. Kill processes
taskkill /F /IM node.exe
taskkill /F /IM bun.exe

# 2. Clean and generate
bun run db:generate:force
```

**Seed Data (Optional):**
```bash
bun run seed
# Menambahkan 1 contoh device
```

---

### Step 6: Run Development Server

```bash
# Standard (no logging)
bun run dev

# With logging to dev.log
bun run dev:log
```

**Server akan berjalan di:**
- 🌐 **Dashboard:** http://localhost:3000
- 📊 **Prisma Studio:** `bunx prisma studio` → http://localhost:5555

---

## 🎯 What's Next?

### 1. Setup ESP32 Device

```bash
cd firmware/esp32_fire_monitor_complete

# Copy config template
cp config.h.example config.h

# Edit config.h dengan:
# - WiFi SSID & Password
# - Server IP (dapatkan dengan ipconfig/ifconfig)
# - Device ID
# - Lokasi GPS
```

**Upload ke ESP32:**
1. Buka `esp32_fire_monitor_complete.ino` di Arduino IDE
2. Select Board: ESP32 Dev Module
3. Select Port
4. Upload (Ctrl+U)

**Lihat:** [firmware/esp32_fire_monitor_complete/README.md](firmware/esp32_fire_monitor_complete/README.md)

---

### 2. Add Device di Dashboard

1. Buka http://localhost:3000/devices
2. Click **Add Device**
3. Isi form:
   - Device Name: `ESP32 - Living Room`
   - Device ID: `IoTDevice-0x143000001` (sama dengan firmware)
   - Location: `Jakarta`
   - Auto-detect GPS atau input manual
4. Click **Add**
5. Copy **API Key** dari device card
6. Paste ke `firmware/.../config.h` → `API_KEY`
7. Re-upload firmware

---

### 3. Setup AI Chatbot (Optional)

1. Buka https://openrouter.ai/keys
2. Sign up & create API key
3. Edit `.env`:
   ```env
   OPENROUTER_API_KEY="sk-or-v1-your-key-here"
   OPENROUTER_MODEL="google/gemini-flash-1.5-8b"
   ```
4. Restart dev server

**Free Models:**
- `google/gemini-flash-1.5-8b` ⭐ Recommended
- `openai/gpt-oss-20b:free`
- `meta-llama/llama-3.2-3b-instruct:free`

---

## 📝 Common Commands

### Development

```bash
# Run dev server
bun run dev              # Standard
bun run dev:log          # With logging

# Database
bun run db:generate:safe # Generate Prisma Client (safe)
bunx prisma migrate dev  # Create migration
bunx prisma studio       # Open database GUI
bun run seed             # Seed sample data

# Linting & Formatting
bun run lint             # Check code quality
```

### Production

```bash
# Build
bun run build            # Build untuk production

# Start
bun run start            # Run production server
bun run start:log        # With logging
```

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Or run on different port
bun run dev -- -p 3001
```

### Prisma Generate Error (EPERM)

```bash
# Solution
taskkill /F /IM node.exe
taskkill /F /IM bun.exe
rmdir /s /q node_modules\.prisma
bun run db:generate:safe
```

### Database Not Found

```bash
# Recreate database
bunx prisma migrate reset
```

### Dependencies Error

```bash
# Clean install
rm -rf node_modules
rm bun.lock  # atau package-lock.json
bun install
```

---

## 📚 Documentation

- 📖 [README.md](README.md) - Full documentation
- 🗄️ [DATABASE-SETUP.md](DATABASE-SETUP.md) - Database setup guide
- 🔧 [firmware/.../README.md](firmware/esp32_fire_monitor_complete/README.md) - ESP32 setup
- 📝 [CHANGELOG.md](CHANGELOG.md) - Version history

---

## ✅ Checklist

Pastikan semua langkah berikut sudah dilakukan:

**Backend:**
- [ ] Dependencies installed (`bun install`)
- [ ] Environment variables configured (`.env`)
- [ ] Database generated (`bun run db:generate:safe`)
- [ ] Database migrated (`bunx prisma migrate dev`)
- [ ] Dev server running (`bun run dev`)

**Frontend:**
- [ ] Dashboard accessible (http://localhost:3000)
- [ ] Can add device via UI
- [ ] Maps working
- [ ] Dark mode toggle working

**Hardware (Optional):**
- [ ] ESP32 configured (`config.h`)
- [ ] Firmware uploaded
- [ ] Device registered in dashboard
- [ ] API key configured in firmware
- [ ] ESP32 sending data (check Serial Monitor)

**AI Chatbot (Optional):**
- [ ] OpenRouter API key configured
- [ ] Chatbot responding to queries

---

## 🎉 Success!

Jika semua checklist ✅, selamat! Aplikasi Anda sudah siap.

**Next Steps:**
- Explore dashboard features
- Test AI chatbot
- Monitor ESP32 data real-time
- Customize thresholds
- Deploy to production (see [README.md](README.md#-deployment))

---

## 💬 Need Help?

- 📧 Email: support@fireguardai.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/FireGuardAI/issues)
- 📖 Docs: [Full README](README.md)

---

**Happy Coding! 🔥🚒**

*Estimated Time: 5-10 minutes*
