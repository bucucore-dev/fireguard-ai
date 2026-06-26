# Scripts Directory

This directory contains cross-platform helper scripts for the FireGuard AI project.

## Available Scripts

### `dev-with-log.js`
Runs the Next.js development server with automatic logging to `dev.log`.

**Usage:**
```bash
bun run dev:log
```

**Features:**
- Logs all console output to `dev.log` file
- Cross-platform (Windows, Mac, Linux)
- Displays output in terminal and file simultaneously

---

### `start-with-log.js`
Runs the production server with automatic logging to `server.log`.

**Usage:**
```bash
bun run start:log
```

**Features:**
- Logs all console output to `server.log` file
- Sets NODE_ENV=production automatically
- Cross-platform (Windows, Mac, Linux)

---

### `copy-build-files.js`
Copies static files and public directory to standalone build output.

**Usage:**
```bash
bun run scripts/copy-build-files.js
```

**Features:**
- Replaces Unix `cp -r` commands with Node.js implementation
- Copies `.next/static` to `.next/standalone/.next/static`
- Copies `public` to `.next/standalone/public`
- Cross-platform (Windows, Mac, Linux)

---

### `prisma-generate-safe.js`
Safely generates Prisma Client with automatic retry and cleanup (Windows-specific issue handler).

**Usage:**
```bash
bun run db:generate:safe
```

**Features:**
- Handles Windows EPERM errors automatically
- Retries up to 3 times with cleanup between attempts
- Provides helpful troubleshooting tips
- Cross-platform safe (works on all OS)

**Why This Script?**

Windows often locks `.dll.node` files when dev servers are running, causing `EPERM` errors during `prisma generate`. This script:
1. Detects EPERM errors
2. Cleans up `.prisma/client` folder
3. Retries generation
4. Shows helpful error messages

**Recommended Usage:**
```bash
# Instead of:
bunx prisma generate

# Use:
bun run db:generate:safe
```

---

## Why These Scripts?

The original `package.json` scripts used Unix-specific commands:
- `tee` - not available on Windows CMD
- `cp -r` - not available on Windows CMD
- `2>&1 |` - shell redirection syntax varies by platform

These Node.js scripts provide identical functionality across all operating systems.
