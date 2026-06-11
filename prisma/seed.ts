import { db } from "../src/lib/db";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clean up existing DUMMY data ONLY
  // Do NOT delete real devices added via UI
  const dummyDevices = await db.device.findMany({
    where: { deviceId: { startsWith: 'ESP32-DUMMY' } }
  });
  
  if (dummyDevices.length > 0) {
    const dummyDeviceIds = dummyDevices.map(d => d.id);
    await db.alert.deleteMany({ where: { deviceId: { in: dummyDeviceIds } } });
    await db.sensorLog.deleteMany({ where: { deviceId: { in: dummyDeviceIds } } });
    await db.device.deleteMany({ where: { id: { in: dummyDeviceIds } } });
    console.log(`✅ Cleaned ${dummyDevices.length} existing dummy devices and their logs`);
  }

  // System settings can be upserted or left alone instead of deleted, 
  // but to keep it simple, we won't delete them if we don't want to break existing config
  // just count them or ensure they exist below.

  // Create 20 devices (IoT sensors)
  const devicePromises: any[] = [];
  for (let i = 1; i <= 20; i++) {
    devicePromises.push(
      db.device.create({
        data: {
          deviceId: `ESP32-DUMMY-${i.toString().padStart(3, '0')}`,
          deviceName: `Sensor Titik ${i}`,
          location: `Area ${Math.ceil(i/5)}, Sektor ${i}`,
          apiKey: `fg_dummy_key_${i}`,
          status: "online",
          lastSeen: new Date(),
          latitude: -6.200000 + (Math.random() * 0.05 - 0.025), // Random near Jakarta
          longitude: 106.816666 + (Math.random() * 0.05 - 0.025),
        },
      })
    );
  }
  const devices = await Promise.all(devicePromises);
  console.log(`✅ Created ${devices.length} devices`);

  // Generate logs for the last 2 hours (120 minutes)
  const now = Date.now();
  const minuteMs = 60 * 1000;
  const totalMinutes = 120;

  for (let m = 0; m <= totalMinutes; m++) {
    const createdAt = new Date(now - (totalMinutes - m) * minuteMs);
    
    // Every 10 minutes, randomly pick exactly 2 devices to trigger warning/alert
    const isInterval = (m % 10 === 0);
    let chosenDevices: string[] = [];
    
    if (isInterval) {
      // Shuffle the devices array and pick the first 2
      const shuffled = [...devices].sort(() => 0.5 - Math.random());
      chosenDevices = shuffled.slice(0, 2).map(d => d.id);
    }

    for (const device of devices) {
      let temp = 25 + Math.random() * 5; // Normal: 25-30°C
      let gasLevel = Math.random() * 10; // Normal gas: 0-10 ppm
      let flameDetected = false;
      let statusLevel: "normal" | "warning" | "danger" | "critical" = "normal";
      
      const isChosen = chosenDevices.includes(device.id);

      if (isChosen) {
        // Randomly assign severity: 60% warning, 30% danger, 10% critical
        const rand = Math.random();
        if (rand < 0.6) {
          temp = 50 + Math.random() * 10; // 50-60°C
          gasLevel = 40 + Math.random() * 20; 
          statusLevel = "warning";
        } else if (rand < 0.9) {
          temp = 70 + Math.random() * 10; // 70-80°C
          gasLevel = 80 + Math.random() * 20;
          statusLevel = "danger";
        } else {
          temp = 85 + Math.random() * 15; // 85-100°C
          gasLevel = 100 + Math.random() * 20;
          flameDetected = true;
          statusLevel = "critical";
        }
      }

      await db.sensorLog.create({
        data: {
          deviceId: device.id,
          temperature: Math.round(temp * 10) / 10,
          humidity: Math.round((40 + Math.random() * 20) * 10) / 10,
          flameDetected,
          gasLevel: Math.round(gasLevel * 10) / 10,
          statusLevel,
          createdAt,
        },
      });

      if (isChosen) {
        // Create an alert corresponding to the status
        let alertType = "high_temperature";
        let message = `Suhu meningkat pada ${device.deviceName} (${Math.round(temp)}°C)`;
        
        if (statusLevel === "danger") {
          message = `BAHAYA: Suhu/Gas sangat tinggi pada ${device.deviceName} (${Math.round(temp)}°C)!`;
          if (Math.random() > 0.5) {
            alertType = "gas_leak";
            message = `Kebocoran gas terdeteksi pada ${device.deviceName} (${Math.round(gasLevel)} ppm)`;
          }
        } else if (statusLevel === "critical") {
          alertType = "fire_detected";
          message = `🔥 KEBAKARAN TERDETEKSI pada ${device.deviceName}! Suhu: ${Math.round(temp)}°C`;
        }

        await db.alert.create({
          data: {
            deviceId: device.id,
            alertType,
            message,
            severity: statusLevel,
            resolved: m < totalMinutes - 20, // older alerts resolved
            resolvedAt: m < totalMinutes - 20 ? new Date(createdAt.getTime() + 5 * minuteMs) : null,
            createdAt,
          },
        });
      }
    }
  }

  console.log("✅ Created sensor logs and alerts (mostly normal, warning every 10 min)");

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
    skipDuplicates: true,
  });
  console.log("✅ Created/Verified system settings");

  console.log("");
  console.log("🎉 Seeding complete!");
  console.log("");
  console.log(`   - ${devices.length} devices created`);
  console.log(`   - Sensor logs & alerts generated for 2 hours`);
  console.log("");

  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});

