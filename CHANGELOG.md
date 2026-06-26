# 📝 Changelog - FireGuardAI

## [1.0.1] - 2026-06-26

### 🎯 Cross-Platform Improvements

#### ✅ Scripts (Windows, Mac, Linux)
- **Replaced Unix-specific commands** with Node.js scripts
  - `tee` → `dev-with-log.js` dan `start-with-log.js`
  - `cp -r` → `copy-build-files.js`
  - `2>&1 |` → Built-in Node.js stream piping

- **New Scripts Added:**
  - `scripts/dev-with-log.js` - Dev server dengan logging ke `dev.log`
  - `scripts/start-with-log.js` - Production server dengan logging ke `server.log`
  - `scripts/copy-build-files.js` - Copy static files (cross-platform)
  - `scripts/README.md` - Dokumentasi scripts

- **Updated package.json:**
  ```json
  {
    "dev": "next dev -p 3000",
    "dev:log": "bun run scripts/dev-with-log.js",
    "build": "next build && bun run scripts/copy-build-files.js",
    "start": "cross-env NODE_ENV=production bun .next/standalone/server.js",
    "start:log": "bun run scripts/start-with-log.js"
  }
  ```

- **Added dependency:**
  - `cross-env@^7.0.3` - Cross-platform environment variables

#### 📚 Documentation Updates

##### Main README.md
- ✅ Updated installation steps dengan cross-platform commands
- ✅ Added database setup section (SQLite, PostgreSQL, Supabase)
- ✅ Added database comparison table
- ✅ Added Prisma commands reference
- ✅ Improved troubleshooting section
- ✅ Added cross-platform notes di production build
- ✅ Updated project structure dengan `scripts/` folder

##### Firmware README.md
- ✅ Updated konfigurasi WiFi & Server section
- ✅ Emphasized penggunaan `config.h` untuk keamanan
- ✅ Added step-by-step API key generation
- ✅ Added koordinat GPS setup guide
- ✅ Updated troubleshooting dengan platform-specific commands
- ✅ Added web application integration section
- ✅ Added platform support badge (Windows, Mac, Linux)

##### New Documentation Files
- ✅ **DATABASE-SETUP.md** - Comprehensive database setup guide
  - SQLite setup lengkap
  - PostgreSQL installation (Windows, Mac, Linux)
  - Supabase setup dengan screenshots
  - Migration guide
  - Backup & restore procedures
  - Performance tuning tips
  - Troubleshooting database issues

- ✅ **scripts/README.md** - Cross-platform scripts documentation

#### 🔐 Security Improvements
- ✅ `config.h` template (firmware credentials)
- ✅ Environment variables properly documented
- ✅ All sensitive files sudah di-gitignore:
  - `firmware/**/config.h`
  - `.env`
  - `*.log` files

#### 🐛 Bug Fixes
- ✅ Fixed Unix commands yang tidak bekerja di Windows CMD
- ✅ Fixed PATH issues dengan absolute paths
- ✅ Fixed streaming output untuk logging

### 📦 File Changes

**Added:**
```
scripts/
├── dev-with-log.js         # Dev server dengan logging
├── start-with-log.js       # Production server dengan logging
├── copy-build-files.js     # Copy build files
└── README.md               # Scripts documentation

DATABASE-SETUP.md            # Comprehensive database guide
CHANGELOG.md                 # This file
```

**Modified:**
```
package.json                 # Updated scripts & dependencies
README.md                    # Improved documentation
firmware/esp32_fire_monitor_complete/README.md  # Updated setup guide
.gitignore                   # Already has *.log entries
```

**No Changes:**
```
.env.example                 # Already well documented
prisma/schema.prisma         # Database schema unchanged
src/                         # Application code unchanged
```

---

## [1.0.0] - 2026-05-09

### 🎉 Initial Release

#### Core Features
- ✅ Real-time IoT monitoring dengan ESP32
- ✅ Multi-sensor support (LM35, Flame, MQ-2)
- ✅ AI chatbot dengan OpenRouter
- ✅ Interactive maps dengan Leaflet
- ✅ Data visualization dengan Chart.js
- ✅ Dark mode support
- ✅ API authentication dengan API keys
- ✅ Multi-database support (SQLite, PostgreSQL, Supabase)

#### Tech Stack
- Next.js 16.2.9
- TypeScript 5
- Prisma ORM
- Tailwind CSS 4
- shadcn/ui components
- React 19
- Arduino (ESP32)

---

## 🚀 Upcoming Features

### Version 1.1 (In Progress)
- 🚧 Tampilan sensor kelembaban di UI
- 🚧 Tampilan deteksi api di dashboard
- 🚧 Monitoring level gas dengan grafik
- [ ] Voice input untuk chatbot
- [ ] Export chat history
- [ ] Multi-language support (ID/EN)
- [ ] Streaming AI responses
- [ ] Push notifications
- [ ] Email alerts

### Version 2.0 (Future)
- [ ] Mobile app (React Native)
- [ ] Multi-tenant dengan autentikasi
- [ ] Advanced analytics
- [ ] Machine learning predictions
- [ ] Telegram bot integration
- [ ] SMS alerts
- [ ] Complete multi-sensor dashboard

---

## 📋 Migration Notes

### From v1.0.0 to v1.0.1

**No Breaking Changes!** Update aman dilakukan.

#### Steps:

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Install new dependency:**
   ```bash
   bun install
   # Akan install cross-env@^7.0.3
   ```

3. **Update scripts (opsional):**
   ```bash
   # Gunakan script baru untuk logging
   bun run dev:log    # Instead of: bun run dev
   bun run start:log  # Instead of: bun run start
   ```

4. **Firmware config (jika belum):**
   ```bash
   cd firmware/esp32_fire_monitor_complete
   cp config.h.example config.h
   # Edit config.h dengan kredensial Anda
   ```

**That's it!** Aplikasi akan tetap bekerja seperti biasa.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## 📞 Support

- 📧 Email: support@fireguardai.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/FireGuardAI/issues)
- 📖 Docs: [GitHub Wiki](https://github.com/yourusername/FireGuardAI/wiki)

---

**Maintained by FireGuardAI Team**

Last Updated: June 26, 2026
