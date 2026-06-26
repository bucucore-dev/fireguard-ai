# 🗄️ FireGuardAI - Database Setup Guide

Panduan lengkap setup database untuk FireGuardAI di Windows, Mac, dan Linux.

---

## 📋 Table of Contents

- [SQLite Setup (Development)](#sqlite-setup-development)
- [PostgreSQL Setup (Production)](#postgresql-setup-production)
- [Supabase Setup (Cloud)](#supabase-setup-cloud)
- [Database Migration](#database-migration)
- [Backup & Restore](#backup--restore)
- [Performance Tuning](#performance-tuning)
- [Troubleshooting](#troubleshooting)

---

## 🔵 SQLite Setup (Development)

### Kelebihan
- ✅ **Zero Configuration** - Tidak perlu install database server
- ✅ **Instant Setup** - Langsung jalan dalam hitungan detik
- ✅ **Portable** - Database dalam 1 file, mudah di-backup
- ✅ **Perfect untuk Development** - Testing lokal tanpa kompleksitas

### Kekurangan
- ⚠️ **Concurrent Access Terbatas** - Kurang cocok untuk production
- ⚠️ **No Network Access** - Hanya bisa diakses lokal
- ⚠️ **Limited Features** - Fitur database terbatas

### Setup Steps

#### 1. Copy Environment File
```bash
cp .env.example .env
```

#### 2. Konfigurasi Database URL
Edit file `.env`:
```env
DATABASE_URL="file:./prisma/db/custom.db"
```

#### 3. Update Prisma Schema
Edit file `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

#### 4. Generate Prisma Client
```bash
bunx prisma generate
```

#### 5. Jalankan Database Migration
```bash
bunx prisma migrate dev --name init
```

#### 6. (Opsional) Seed Data
```bash
bun run seed
```

#### 7. Verifikasi
```bash
# Buka Prisma Studio
bunx prisma studio
# Akses di browser: http://localhost:5555
```

### File Location
Database akan dibuat di:
```
prisma/db/custom.db
prisma/db/custom.db-journal (temporary file)
```

**⚠️ Catatan:** File ini sudah di-gitignore, tidak akan ter-commit ke Git.

---

## 🟢 PostgreSQL Setup (Production)

### Kelebihan
- ✅ **High Performance** - Cocok untuk production dengan traffic tinggi
- ✅ **Full SQL Features** - Mendukung fitur database lengkap
- ✅ **Concurrent Access** - Multi-user tanpa bottleneck
- ✅ **ACID Compliance** - Data integrity terjamin

### Kekurangan
- ⚠️ **Manual Maintenance** - Perlu maintenance dan monitoring
- ⚠️ **Resource Intensive** - Butuh RAM dan storage lebih banyak

---

### 🪟 Windows Installation

#### Option 1: Official Installer (Recommended)

1. **Download PostgreSQL:**
   - Kunjungi: https://www.postgresql.org/download/windows/
   - Download installer (PostgreSQL 15 atau 16)

2. **Install PostgreSQL:**
   ```
   - Run installer (.exe)
   - Port: 5432 (default)
   - Password: [Set strong password]
   - Install Stack Builder: No (skip)
   ```

3. **Verifikasi Installation:**
   ```cmd
   psql --version
   ```

4. **Start PostgreSQL Service:**
   ```cmd
   net start postgresql-x64-15
   ```

#### Option 2: Chocolatey

```powershell
# Install Chocolatey dulu (jika belum)
# https://chocolatey.org/install

# Install PostgreSQL
choco install postgresql

# Start service
net start postgresql-x64-15
```

#### Option 3: Docker

```bash
# Install Docker Desktop dulu
# https://www.docker.com/products/docker-desktop

# Run PostgreSQL container
docker run --name postgres-fireguard -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres:15
```

---

### 🍎 Mac Installation

#### Option 1: Homebrew (Recommended)

```bash
# Install Homebrew (jika belum)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Verifikasi
psql --version
```

#### Option 2: Postgres.app

1. Download dari: https://postgresapp.com/
2. Drag Postgres.app ke Applications
3. Open Postgres.app
4. Click "Initialize"

#### Option 3: Docker

```bash
# Install Docker Desktop dulu
# https://www.docker.com/products/docker-desktop

# Run PostgreSQL
docker run --name postgres-fireguard -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres:15
```

---

### 🐧 Linux Installation

#### Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verifikasi
psql --version
```

#### Fedora/RHEL/CentOS

```bash
# Install PostgreSQL
sudo dnf install postgresql-server postgresql-contrib

# Initialize database
sudo postgresql-setup --initdb

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Arch Linux

```bash
# Install PostgreSQL
sudo pacman -S postgresql

# Initialize database
sudo -u postgres initdb -D /var/lib/postgres/data

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

### Setup Database

Setelah install PostgreSQL di platform manapun:

#### 1. Login ke PostgreSQL

**Windows:**
```cmd
psql -U postgres
```

**Mac:**
```bash
psql postgres
```

**Linux:**
```bash
sudo -u postgres psql
```

#### 2. Buat Database dan User

```sql
-- Buat database
CREATE DATABASE fireguard_ai;

-- Buat user
CREATE USER fireguard_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fireguard_ai TO fireguard_user;

-- Exit
\q
```

#### 3. Konfigurasi `.env`

```env
DATABASE_URL="postgresql://fireguard_user:your_secure_password_here@localhost:5432/fireguard_ai"
```

#### 4. Update `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 5. Generate dan Migrate

```bash
bunx prisma generate
bunx prisma migrate deploy
bun run seed  # Opsional
```

#### 6. Verifikasi

```bash
# Connect ke database
psql -U fireguard_user -d fireguard_ai

# List tables
\dt

# Exit
\q
```

---

## ☁️ Supabase Setup (Cloud)

### Kelebihan
- ✅ **Free Tier** - 500MB storage gratis
- ✅ **Zero Maintenance** - Fully managed
- ✅ **Auto Backups** - Point-in-time recovery
- ✅ **Remote Access** - Akses dari mana saja
- ✅ **Built-in Dashboard** - UI untuk manage data

### Kekurangan
- ⚠️ **Vendor Lock-in** - Terikat dengan Supabase
- ⚠️ **Internet Required** - Butuh koneksi internet

### Setup Steps

#### 1. Buat Account

1. Kunjungi: https://supabase.com
2. Click **Start your project**
3. Sign up dengan:
   - GitHub (recommended)
   - Google
   - Email

#### 2. Buat Project

1. Click **New Project**
2. Isi form:
   ```
   Name: fireguard-ai
   Database Password: [Strong password - SIMPAN INI!]
   Region: Singapore (untuk Indonesia)
   Pricing Plan: Free
   ```
3. Wait ~2 menit untuk provisioning

#### 3. Dapatkan Connection String

1. Go to **Settings** (⚙️) → **Database**
2. Scroll ke **Connection string**
3. Tab **URI**
4. Copy connection string:
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

#### 4. Konfigurasi `.env`

```env
# Ganti [YOUR-PASSWORD] dengan password Anda
DATABASE_URL="postgresql://postgres.abcdefgh:your_password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

#### 5. Update `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 6. Generate dan Migrate

```bash
bunx prisma generate
bunx prisma migrate deploy
bun run seed  # Opsional
```

#### 7. Verifikasi di Dashboard

1. Go to **Table Editor** di Supabase
2. Lihat tables: `Device`, `SensorLog`, `Alert`, `SystemSettings`

### Supabase Tips

#### Enable Connection Pooling (Recommended)

Untuk production, gunakan pooler (port 6543):
```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

#### Direct Connection (Development)

Untuk development (port 5432):
```env
DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
```

#### Monitor Usage

1. Go to **Settings** → **Usage**
2. Cek:
   - Database size
   - API requests
   - Bandwidth

Free tier limits:
- 500 MB database space
- Unlimited API requests
- 2 GB bandwidth

---

## 🔄 Database Migration

### Switch dari SQLite ke PostgreSQL

#### 1. Export Data dari SQLite

```bash
# Via Prisma Studio
bunx prisma studio
# Export manual via UI

# Atau via script SQL
sqlite3 prisma/db/custom.db .dump > backup.sql
```

#### 2. Setup PostgreSQL

```bash
# Ikuti PostgreSQL setup di atas
```

#### 3. Update Configuration

Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Ubah dari "sqlite"
  url      = env("DATABASE_URL")
}
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/fireguard_ai"
```

#### 4. Create New Migration

```bash
# Delete migration history (opsional)
rm -rf prisma/migrations

# Create fresh migration
bunx prisma migrate dev --name init
```

#### 5. Import Data

```bash
# Via Prisma Studio atau custom script
bun run seed  # Atau manual import
```

### Switch dari PostgreSQL ke Supabase

Tidak perlu migration karena keduanya PostgreSQL!

#### 1. Backup Data

```bash
pg_dump -U fireguard_user fireguard_ai > backup.sql
```

#### 2. Update .env

```env
DATABASE_URL="postgresql://postgres:[password]@[supabase-host]:6543/postgres"
```

#### 3. Restore Data

```bash
psql -h [supabase-host] -U postgres -d postgres < backup.sql
```

---

## 💾 Backup & Restore

### SQLite Backup

```bash
# Simple copy
cp prisma/db/custom.db prisma/db/custom.db.backup

# Dengan timestamp
cp prisma/db/custom.db "backup_$(date +%Y%m%d_%H%M%S).db"
```

### PostgreSQL Backup

```bash
# Full backup
pg_dump -U fireguard_user -d fireguard_ai -F c -b -v -f backup.dump

# SQL format
pg_dump -U fireguard_user -d fireguard_ai > backup.sql

# Restore
pg_restore -U fireguard_user -d fireguard_ai -v backup.dump
# atau
psql -U fireguard_user -d fireguard_ai < backup.sql
```

### Supabase Backup

#### Via Dashboard (Free Tier)

1. Go to **Settings** → **Database** → **Backups**
2. Download backup

#### Via CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Backup
supabase db dump -f backup.sql
```

### Automated Backup Script

Create `scripts/backup-db.js`:

```javascript
#!/usr/bin/env node
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const backupDir = path.join(process.cwd(), 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Backup command (adjust based on your database)
const command = `pg_dump ${process.env.DATABASE_URL} > ${backupFile}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Backup failed: ${error.message}`);
    return;
  }
  console.log(`✅ Backup created: ${backupFile}`);
});
```

Add to `package.json`:
```json
{
  "scripts": {
    "backup": "node scripts/backup-db.js"
  }
}
```

Run backup:
```bash
bun run backup
```

---

## ⚡ Performance Tuning

### SQLite Optimization

Edit connection string di `.env`:
```env
DATABASE_URL="file:./prisma/db/custom.db?connection_limit=1&timeout=30"
```

### PostgreSQL Optimization

#### 1. Connection Pooling

Install `pg-pool`:
```bash
bun add pg-pool
```

Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/fireguard_ai?connection_limit=10&pool_timeout=30"
```

#### 2. Indexing

Add indexes to frequently queried fields (already in schema):
```prisma
@@index([deviceId])
@@index([createdAt])
@@index([statusLevel])
```

#### 3. PostgreSQL Configuration

Edit `postgresql.conf`:
```conf
# Increase connections
max_connections = 100

# Increase memory
shared_buffers = 256MB
effective_cache_size = 1GB

# Enable query planner
random_page_cost = 1.1
```

Restart PostgreSQL after changes.

### Supabase Optimization

1. **Use Connection Pooling**: Port 6543 (pooler) instead of 5432
2. **Enable Prepared Statements**: Already handled by Prisma
3. **Monitor Query Performance**: Check Dashboard → Database → Query Performance

---

## 🐛 Troubleshooting

### Prisma Issues

#### Error: EPERM - Operation Not Permitted (Windows)

**Full Error:**
```
Error: EPERM: operation not permitted, rename 'node_modules\.prisma\client\query_engine-windows.dll.node.tmp' -> 'node_modules\.prisma\client\query_engine-windows.dll.node'
```

**Penyebab:**
- File `.dll.node` sedang digunakan oleh dev server atau IDE
- Windows file lock tidak released properly
- Multiple processes accessing Prisma Client simultaneously

**Solusi:**

**Option 1: Safe Generate Script (Recommended)**
```bash
# Gunakan script yang auto-handle retries
bun run db:generate:safe
```

**Option 2: Manual Fix**
```bash
# 1. Stop SEMUA dev servers
# Tekan Ctrl+C di semua terminal yang running

# 2. Kill Node.js dan Bun processes
taskkill /F /IM node.exe
taskkill /F /IM bun.exe

# 3. Hapus folder .prisma
rmdir /s /q node_modules\.prisma

# 4. Generate ulang
bunx prisma generate
```

**Option 3: Close IDE**
```bash
# Jika masih error:
# 1. Close VS Code / IDE completely
# 2. Open fresh terminal
# 3. Run: bunx prisma generate
```

**Option 4: Restart Computer**
```bash
# Last resort jika file masih locked
# Windows kadang tidak release file lock
# Restart akan clear semua locks
```

**Pencegahan:**
- ✅ Selalu stop dev server sebelum `prisma generate`
- ✅ Gunakan `bun run db:generate:safe` instead of `bunx prisma generate`
- ✅ Close IDE terminal sebelum generate
- ❌ Jangan jalankan multiple `prisma generate` bersamaan

---

### Common Issues

#### 1. Port Already in Use

**PostgreSQL default port 5432 in use:**

```bash
# Windows - Find process
netstat -ano | findstr :5432
taskkill /PID [PID] /F

# Mac/Linux - Find and kill
lsof -ti:5432 | xargs kill -9
```

#### 2. Connection Refused

**PostgreSQL not running:**

```bash
# Windows
net start postgresql-x64-15

# Mac
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

#### 3. Authentication Failed

**Wrong username/password:**

```bash
# Reset PostgreSQL password
# Windows/Mac/Linux
psql -U postgres
ALTER USER fireguard_user WITH PASSWORD 'new_password';
\q

# Update .env dengan password baru
```

#### 4. Database Does Not Exist

```bash
# Create database
createdb -U postgres fireguard_ai

# Or via psql
psql -U postgres
CREATE DATABASE fireguard_ai;
\q
```

#### 5. Migration Failed

```bash
# Check migration status
bunx prisma migrate status

# Resolve failed migration
bunx prisma migrate resolve --applied [migration_name]
# or
bunx prisma migrate resolve --rolled-back [migration_name]

# Reset database (⚠️ deletes all data)
bunx prisma migrate reset
```

#### 6. Prisma Client Out of Sync

```bash
# Regenerate Prisma Client
bunx prisma generate

# If still error, delete and regenerate
rm -rf node_modules/.prisma
bunx prisma generate
```

---

## 📊 Database Schema

### Tables

#### Device
```sql
CREATE TABLE Device (
  id TEXT PRIMARY KEY,
  deviceId TEXT UNIQUE NOT NULL,
  deviceName TEXT NOT NULL,
  apiKey TEXT UNIQUE NOT NULL,
  location TEXT,
  latitude REAL,
  longitude REAL,
  status TEXT DEFAULT 'offline',
  lastSeen DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### SensorLog
```sql
CREATE TABLE SensorLog (
  id TEXT PRIMARY KEY,
  deviceId TEXT NOT NULL,
  temperature REAL NOT NULL,
  humidity REAL,
  flameDetected BOOLEAN DEFAULT FALSE,
  gasLevel REAL,
  statusLevel TEXT DEFAULT 'normal',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deviceId) REFERENCES Device(id) ON DELETE CASCADE
);
```

#### Alert
```sql
CREATE TABLE Alert (
  id TEXT PRIMARY KEY,
  deviceId TEXT NOT NULL,
  alertType TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'warning',
  resolved BOOLEAN DEFAULT FALSE,
  resolvedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deviceId) REFERENCES Device(id) ON DELETE CASCADE
);
```

---

## 📚 Additional Resources

### Documentation
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [SQLite Docs](https://www.sqlite.org/docs.html)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL management
- [DBeaver](https://dbeaver.io/) - Universal database tool
- [TablePlus](https://tableplus.com/) - Modern database client

---

**Dokumentasi ini mencakup setup database untuk Windows, Mac, dan Linux.**

Untuk pertanyaan atau issues, buka GitHub Issues atau hubungi tim development.

✅ **Cross-Platform Support**
✅ **Production Ready**
✅ **Fully Documented**
