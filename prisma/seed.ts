import { db } from "../src/lib/db";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await db.alert.deleteMany();
  await db.sensorLog.deleteMany();
  await db.device.deleteMany();
  await db.systemSettings.deleteMany();

  console.log("✅ Cleaned existing data");

  // Create devices (IoT sensors)
  const devices = await Promise.all([
    db.device.create({
      data: {
        deviceId: "ESP32-001",
        deviceName: "Sensor Ruang Server",
        location: "Gedung A, Lantai 2",
        apiKey: "fg_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
        status: "online",
        lastSeen: new Date(),
      },
    }),
    db.device.create({
      data: {
        deviceId: "ESP32-002",
        deviceName: "Sensor Gudang",
        location: "Gedung B",
        apiKey: "fg_f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3",
        status: "online",
        lastSeen: new Date(Date.now() - 300000), // 5 menit lalu
      },
    }),
    db.device.create({
      data: {
        deviceId: "ESP32-003",
        deviceName: "Sensor Dapur",
        location: "Gedung A, Lantai 1",
        apiKey: "fg_1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d",
        status: "offline",
        lastSeen: new Date(Date.now() - 3600000 * 2), // 2 jam lalu
      },
    }),
    db.device.create({
      data: {
        deviceId: "ESP32-004",
        deviceName: "Sensor Ruang Listrik",
        location: "Gedung C",
        apiKey: "fg_6f5e4d3c2b1a6f5e4d3c2b1a6f5e4d3c",
        status: "online",
        lastSeen: new Date(Date.now() - 600000), // 10 menit lalu
      },
    }),
  ]);
  console.log("✅ Created 4 devices");

  // Generate sensor logs for each device (last 7 days)
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const device of devices) {
    const logCount = 40 + Math.floor(Math.random() * 20); // 40-60 logs per device
    
    for (let i = 0; i < logCount; i++) {
      const timeOffset = Math.random() * 7 * dayMs;
      const createdAt = new Date(now - timeOffset);

      // Generate realistic temperature with occasional spikes
      let temp = 25 + Math.random() * 15; // 25-40°C base (normal)
      const spikeChance = Math.random();
      let flameDetected = false;
      let statusLevel: "normal" | "warning" | "danger" | "critical" = "normal";

      // Simulate dangerous conditions
      if (spikeChance > 0.97) {
        // 3% chance - CRITICAL (fire detected)
        temp = 85 + Math.random() * 15; // 85-100°C
        flameDetected = true;
        statusLevel = "critical";
      } else if (spikeChance > 0.93) {
        // 4% chance - DANGER (very high temp)
        temp = 70 + Math.random() * 15; // 70-85°C
        flameDetected = Math.random() > 0.7; // 30% chance flame
        statusLevel = "danger";
      } else if (spikeChance > 0.85) {
        // 8% chance - WARNING (high temp)
        temp = 50 + Math.random() * 20; // 50-70°C
        statusLevel = "warning";
      }

      const humidity = 40 + Math.random() * 40; // 40-80%
      const gasLevel = Math.random() * 100; // 0-100 ppm

      await db.sensorLog.create({
        data: {
          deviceId: device.id,
          temperature: Math.round(temp * 10) / 10,
          humidity: Math.round(humidity * 10) / 10,
          flameDetected,
          gasLevel: Math.round(gasLevel * 10) / 10,
          statusLevel,
          createdAt,
        },
      });
    }
  }
  console.log("✅ Created sensor logs (last 7 days)");

  // Generate alerts based on sensor data
  const alertTemplates = [
    { 
      type: "high_temperature", 
      severity: "warning" as const, 
      messages: [
        "Suhu meningkat pada {device}: {temp}°C",
        "Peringatan: Suhu tinggi terdeteksi pada {device}"
      ] 
    },
    { 
      type: "high_temperature", 
      severity: "danger" as const, 
      messages: [
        "BAHAYA: Suhu sangat tinggi pada {device}: {temp}°C!",
        "Suhu melebihi batas aman pada {device}"
      ] 
    },
    { 
      type: "fire_detected", 
      severity: "critical" as const, 
      messages: [
        "🔥 KEBAKARAN TERDETEKSI pada {device}!",
        "DARURAT: Sensor api aktif pada {device}!",
        "⚠️ API TERDETEKSI - {device} - Segera evakuasi!"
      ] 
    },
    { 
      type: "device_offline", 
      severity: "warning" as const, 
      messages: [
        "Perangkat {device} offline",
        "Koneksi terputus dengan {device}"
      ] 
    },
    { 
      type: "gas_leak", 
      severity: "danger" as const, 
      messages: [
        "Kebocoran gas terdeteksi pada {device}",
        "Level gas berbahaya pada {device}"
      ] 
    },
  ];

  for (const device of devices) {
    const alertCount = 3 + Math.floor(Math.random() * 8); // 3-10 alerts per device
    
    for (let i = 0; i < alertCount; i++) {
      const timeOffset = Math.random() * 7 * dayMs;
      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      const messageTemplate = template.messages[Math.floor(Math.random() * template.messages.length)];
      
      const message = messageTemplate
        .replace("{device}", device.deviceName)
        .replace("{temp}", String(Math.round(60 + Math.random() * 35)));

      const createdAt = new Date(now - timeOffset);
      const isResolved = Math.random() > 0.5; // 50% resolved

      await db.alert.create({
        data: {
          deviceId: device.id,
          alertType: template.type,
          message,
          severity: template.severity,
          resolved: isResolved,
          resolvedAt: isResolved ? new Date(createdAt.getTime() + 3600000) : null, // 1 hour after
          createdAt,
        },
      });
    }
  }
  console.log("✅ Created alerts");

  // Create system settings
  await db.systemSettings.createMany({
    data: [
      {
        key: "temp_warning_threshold",
        value: "50",
        description: "Batas suhu untuk peringatan (°C)",
      },
      {
        key: "temp_danger_threshold",
        value: "70",
        description: "Batas suhu untuk bahaya (°C)",
      },
      {
        key: "temp_critical_threshold",
        value: "85",
        description: "Batas suhu untuk kritis (°C)",
      },
      {
        key: "humidity_low_threshold",
        value: "30",
        description: "Batas kelembaban rendah (%)",
      },
      {
        key: "gas_danger_threshold",
        value: "80",
        description: "Batas level gas berbahaya (ppm)",
      },
      {
        key: "device_offline_timeout",
        value: "300",
        description: "Timeout perangkat offline (detik)",
      },
    ],
  });
  console.log("✅ Created system settings");

  console.log("");
  console.log("🎉 Seeding complete!");
  console.log("");
  console.log("📊 Summary:");
  console.log(`   - ${devices.length} devices created`);
  console.log(`   - Sensor logs generated (last 7 days)`);
  console.log(`   - Alerts generated`);
  console.log(`   - System settings configured`);
  console.log("");
  console.log("🔑 API Keys untuk testing:");
  devices.forEach(d => {
    console.log(`   ${d.deviceId}: ${d.apiKey}`);
  });
  console.log("");
  console.log("🚀 Jalankan aplikasi dengan: bun run dev");
  console.log("");

  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});

