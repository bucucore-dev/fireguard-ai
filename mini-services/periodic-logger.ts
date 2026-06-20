#!/usr/bin/env bun
/**
 * ============================================================
 * periodic-logger.ts — FireGuard AI Periodic Normal Logger
 * ============================================================
 *
 * Service ini berjalan sebagai background process terpisah.
 * Setiap 10 menit, ia akan memanggil endpoint /api/cron/periodic-log
 * untuk mencatat snapshot status NORMAL ke database.
 *
 * CARA MENJALANKAN (terminal terpisah):
 *   bun run mini-services/periodic-logger.ts
 *
 * Atau tambah ke startup script:
 *   bun run mini-services/periodic-logger.ts &
 *
 * ENVIRONMENT VARIABLES (dari .env):
 *   NEXT_PUBLIC_APP_URL  — URL dashboard (default: http://localhost:3000)
 *   CRON_SECRET          — Secret key untuk keamanan endpoint
 *
 * LOG:
 *   Setiap trigger ditampilkan di terminal dengan timestamp.
 * ============================================================
 */

import * as fs from "fs";
import * as path from "path";

// ─── Konfigurasi ─────────────────────────────────────────────
const INTERVAL_MS   = 10 * 60 * 1000; // 10 menit
const SERVER_URL    = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const CRON_SECRET   = process.env.CRON_SECRET || "";
const ENDPOINT      = `${SERVER_URL}/api/cron/periodic-log`;
const LOG_FILE      = path.join(import.meta.dir, "periodic-logger.log");

// ─── Utility ─────────────────────────────────────────────────
function timestamp(): string {
  return new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function log(msg: string): void {
  const line = `[${timestamp()}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + "\n");
  } catch {
    // Jika tidak bisa tulis log file, lanjut saja
  }
}

// ─── Main trigger ─────────────────────────────────────────────
async function triggerPeriodicLog(): Promise<void> {
  log("⏰ Triggering periodic normal log...");

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (CRON_SECRET) {
      headers["x-cron-secret"] = CRON_SECRET;
    }

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      log(`❌ HTTP ${response.status} — ${response.statusText}`);
      return;
    }

    const result = await response.json() as {
      success: boolean;
      logged: number;
      skipped: number;
      total_devices: number;
      details: string[];
      message: string;
    };

    if (result.success) {
      log(`✅ Berhasil — ${result.logged} log dibuat, ${result.skipped} dilewati dari ${result.total_devices} device aktif`);
      if (result.details?.length > 0) {
        result.details.forEach((d: string) => log(`   · ${d}`));
      }
    } else {
      log(`⚠️  Gagal — ${JSON.stringify(result)}`);
    }
  } catch (err: any) {
    log(`❌ Error koneksi ke ${ENDPOINT}: ${err?.message || err}`);
    log("   Pastikan server Next.js sudah berjalan (bun dev)");
  }
}

// ─── Startup ──────────────────────────────────────────────────
console.log("╔══════════════════════════════════════════════════════╗");
console.log("║  FireGuard AI — Periodic Normal Logger               ║");
console.log("║  ISO/IEC 17025 — Continuous Monitoring Evidence      ║");
console.log("╚══════════════════════════════════════════════════════╝");
console.log(`  Server  : ${SERVER_URL}`);
console.log(`  Endpoint: ${ENDPOINT}`);
console.log(`  Interval: setiap 10 menit`);
console.log(`  Secret  : ${CRON_SECRET ? "✅ dikonfigurasi" : "⚠️  tidak diset (tidak aman!)"}`);
console.log(`  Log file: ${LOG_FILE}`);
console.log("───────────────────────────────────────────────────────");
console.log("");

// Jalankan segera saat startup (tidak perlu tunggu 10 menit pertama)
log("🚀 Service dimulai — trigger pertama segera...");
triggerPeriodicLog();

// Lalu jadwalkan setiap 10 menit
setInterval(triggerPeriodicLog, INTERVAL_MS);

log(`⏱  Trigger berikutnya dalam 10 menit (${new Date(Date.now() + INTERVAL_MS).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })})`);

// Handle graceful shutdown
process.on("SIGINT", () => {
  log("🛑 Service dihentikan (SIGINT)");
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("🛑 Service dihentikan (SIGTERM)");
  process.exit(0);
});
