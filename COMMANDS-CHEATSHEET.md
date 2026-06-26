# 📝 Commands Cheat Sheet - FireGuardAI

Quick reference untuk semua commands yang sering digunakan.

---

## 🚀 Development

### Start Development Server

```bash
# Standard
bun run dev

# With logging to dev.log
bun run dev:log

# On different port
bun run dev -- -p 3001
```

**Access:**
- 🌐 Dashboard: http://localhost:3000
- 📊 API Docs: http://localhost:3000/api

---

## 🗄️ Database Commands

### Prisma Generate (Create Client)

```bash
# ⭐ RECOMMENDED: Safe generate with auto-retry
bun run db:generate:safe

# 🔨 FORCE: Clean .prisma first, then generate
bun run db:generate:force

# ⚡ STANDARD: Normal generate (may fail if dev server running)
bun run db:generate
# or
bunx prisma generate
```

**When to use:**
- ✅ After changing `prisma/schema.prisma`
- ✅ After `npm install` or `bun install`
- ✅ If getting "Prisma Client not found" error

---

### Database Migration

```bash
# Create new migration (dev)
bunx prisma migrate dev --name migration_name

# Apply migrations (production)
bunx prisma migrate deploy

# Check migration status
bunx prisma migrate status

# Reset database (⚠️ DELETES ALL DATA!)
bunx prisma migrate reset

# Resolve failed migration
bunx prisma migrate resolve --applied migration_name
```

---

### Database Management

```bash
# Push schema without migration (fast prototyping)
bunx prisma db push

# Seed database with sample data
bun run seed

# Open Prisma Studio (GUI for database)
bunx prisma studio
# Access: http://localhost:5555

# Format schema file
bunx prisma format

# Validate schema
bunx prisma validate
```

---

## 🏗️ Build & Production

### Build for Production

```bash
# Build
bun run build

# Start production server
bun run start

# Start with logging
bun run start:log
```

---

### Docker

```bash
# Build Docker image
bun run docker:build

# Run with docker-compose
bun run docker:run

# Stop containers
bun run docker:stop

# View logs
bun run docker:logs
```

---

## 🔍 Debugging & Troubleshooting

### Kill Processes

```bash
# Windows - Kill Node.js and Bun
taskkill /F /IM node.exe
taskkill /F /IM bun.exe

# Mac/Linux - Kill Node.js
killall node
killall bun

# Kill process on specific port (e.g., 3000)
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

### Clean Install

```bash
# Windows
rmdir /s /q node_modules
del bun.lock
bun install

# Mac/Linux
rm -rf node_modules
rm bun.lock
bun install

# Clean .next build
# Windows
rmdir /s /q .next

# Mac/Linux
rm -rf .next
```

---

### Fix Prisma EPERM (Windows)

```bash
# Quick one-liner
taskkill /F /IM node.exe & taskkill /F /IM bun.exe & bun run db:generate:force

# Or step by step:
taskkill /F /IM node.exe
taskkill /F /IM bun.exe
rmdir /s /q node_modules\.prisma
bun run db:generate:safe
```

---

## 🧪 Testing & Quality

### Linting

```bash
# Check code quality
bun run lint

# Auto-fix issues
eslint . --fix
```

---

## 🤖 Background Services

### Periodic Logger

```bash
# Start periodic logger (production)
bun run logger:start

# Start with .env file (development)
bun run logger:dev
```

---

## 📦 Package Management

### Bun Commands

```bash
# Install dependencies
bun install

# Add package
bun add package-name

# Add dev dependency
bun add -d package-name

# Remove package
bun remove package-name

# Update all packages
bun update

# Check outdated packages
bun outdated
```

---

### NPM Alternative

```bash
# Install
npm install

# Add package
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Remove
npm uninstall package-name

# Update
npm update

# Outdated
npm outdated
```

---

## 🔐 Environment Setup

### Create .env File

```bash
# Copy template
cp .env.example .env

# Windows (CMD)
copy .env.example .env

# Edit with nano (Linux/Mac)
nano .env

# Edit with notepad (Windows)
notepad .env
```

---

## 📱 ESP32 Firmware

### Arduino IDE Commands

```
Tools → Board → ESP32 Dev Module
Tools → Port → [Your COM Port]
Sketch → Upload (Ctrl+U)
Tools → Serial Monitor (Ctrl+Shift+M)
```

---

### Firmware Configuration

```bash
# Create config from template
cd firmware/esp32_fire_monitor_complete
cp config.h.example config.h

# Windows
copy config.h.example config.h

# Edit config
notepad config.h  # Windows
nano config.h     # Mac/Linux
```

---

## 🌐 Network & Server

### Get Local IP Address

```bash
# Windows
ipconfig

# Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Linux
hostname -I
```

---

### Test API Endpoint

```bash
# Test with curl (all platforms)
curl http://localhost:3000/api/devices

# With authentication
curl -X POST http://localhost:3000/api/device/data \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"your_key","deviceId":"test","temperature":25}'
```

---

## 🆘 Emergency Commands

### Quick Recovery

```bash
# Full reset (⚠️ NUCLEAR OPTION)
# Windows
taskkill /F /IM node.exe
taskkill /F /IM bun.exe
rmdir /s /q node_modules .next node_modules\.prisma
del bun.lock
bun install
bun run db:generate:safe
bunx prisma migrate dev
bun run dev

# Mac/Linux
killall node bun
rm -rf node_modules .next node_modules/.prisma bun.lock
bun install
bun run db:generate:safe
bunx prisma migrate dev
bun run dev
```

---

## 📊 Monitoring

### View Logs

```bash
# Development logs (if using dev:log)
tail -f dev.log          # Mac/Linux
Get-Content dev.log -Wait  # Windows PowerShell
type dev.log             # Windows CMD (static)

# Production logs (if using start:log)
tail -f server.log
Get-Content server.log -Wait
```

---

### Database Inspection

```bash
# SQLite - Direct access
sqlite3 prisma/db/custom.db

# PostgreSQL - Direct access
psql -U username -d database_name

# Or use Prisma Studio (all databases)
bunx prisma studio
```

---

## 🔗 Useful URLs

```
Development:
  Dashboard:      http://localhost:3000
  Prisma Studio:  http://localhost:5555
  API Base:       http://localhost:3000/api

Production:
  (Configure based on your deployment)
```

---

## 💡 Pro Tips

### Aliases (Add to ~/.bashrc or ~/.zshrc)

```bash
# Add these to your shell config
alias dev="bun run dev"
alias dbgen="bun run db:generate:safe"
alias dbstudio="bunx prisma studio"
alias dbreset="bunx prisma migrate reset"
alias fixit="taskkill /F /IM node.exe && bun run db:generate:force"
```

### VS Code Tasks

Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Server",
      "type": "shell",
      "command": "bun run dev",
      "problemMatcher": []
    },
    {
      "label": "Prisma Studio",
      "type": "shell",
      "command": "bunx prisma studio",
      "problemMatcher": []
    }
  ]
}
```

---

## 📚 Learn More

- 📖 [Full Documentation](README.md)
- 🗄️ [Database Setup Guide](DATABASE-SETUP.md)
- 🚀 [Quick Start Guide](QUICK-START.md)
- 🔧 [Scripts Documentation](scripts/README.md)
- 📱 [ESP32 Firmware Guide](firmware/esp32_fire_monitor_complete/README.md)

---

**Last Updated:** June 26, 2026

*Bookmark this page for quick reference! 📌*
