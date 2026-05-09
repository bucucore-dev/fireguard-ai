import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Vendor IDs untuk IoT devices yang umum
const IOT_VENDOR_IDS = [
  "10c4", // Silicon Labs (ESP32, ESP8266)
  "1a86", // QinHeng Electronics (CH340 - Arduino clones)
  "0403", // FTDI (Arduino, ESP32)
  "2341", // Arduino
  "2e8a", // Raspberry Pi Pico
  "303a", // Espressif (ESP32-S2, ESP32-S3, ESP32-C3)
  "0483", // STMicroelectronics (STM32)
  "16c0", // Van Ooijen Technische Informatica (Teensy)
  "239a", // Adafruit
  "1b4f", // SparkFun
];

// Nama vendor yang dikenali sebagai IoT devices
const IOT_VENDOR_NAMES = [
  "silicon labs",
  "qinheng",
  "ftdi",
  "arduino",
  "espressif",
  "raspberry pi",
  "stmicroelectronics",
  "teensy",
  "adafruit",
  "sparkfun",
  "ch340",
  "cp210",
  "esp32",
  "esp8266",
];

// Perangkat yang harus diabaikan (camera, mic, dll)
const IGNORED_DEVICES = [
  "camera",
  "webcam",
  "microphone",
  "audio",
  "bluetooth",
  "mouse",
  "keyboard",
  "hub",
  "card reader",
  "storage",
  "disk",
];

interface USBDevice {
  vendorId: string;
  productId: string;
  manufacturer: string;
  product: string;
  serialNumber?: string;
  port: string;
  deviceType: string;
}

/**
 * Deteksi perangkat USB IoT yang terhubung
 * Khusus untuk ESP32, Arduino, Raspberry Pi, dan modul IoT lainnya
 */
export async function GET() {
  try {
    const platform = process.platform;
    let devices: USBDevice[] = [];

    if (platform === "darwin") {
      // macOS
      devices = await detectMacOSDevices();
    } else if (platform === "linux") {
      // Linux
      devices = await detectLinuxDevices();
    } else if (platform === "win32") {
      // Windows
      devices = await detectWindowsDevices();
    } else {
      return NextResponse.json({
        success: false,
        error: "Unsupported platform",
      });
    }

    // Filter hanya IoT devices
    const iotDevices = devices.filter(isIoTDevice);

    return NextResponse.json({
      success: true,
      data: {
        devices: iotDevices,
        count: iotDevices.length,
        platform,
      },
    });
  } catch (error) {
    console.error("Error detecting USB devices:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to detect USB devices",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Deteksi perangkat di macOS menggunakan system_profiler
 */
async function detectMacOSDevices(): Promise<USBDevice[]> {
  try {
    const { stdout } = await execAsync(
      "system_profiler SPUSBDataType -json -detailLevel mini"
    );
    const data = JSON.parse(stdout);
    const devices: USBDevice[] = [];

    function parseUSBTree(items: any[], parentPort = "") {
      if (!items) return;

      for (const item of items) {
        if (item._name && item.vendor_id && item.product_id) {
          const vendorId = item.vendor_id.replace("0x", "").toLowerCase();
          const productId = item.product_id.replace("0x", "").toLowerCase();

          devices.push({
            vendorId,
            productId,
            manufacturer: item.manufacturer || item._name || "Unknown",
            product: item._name || "Unknown Device",
            serialNumber: item.serial_num,
            port: item.location_id || parentPort,
            deviceType: detectDeviceType(vendorId, item._name),
          });
        }

        // Rekursif untuk nested devices
        if (item._items) {
          parseUSBTree(item._items, item.location_id || parentPort);
        }
      }
    }

    if (data.SPUSBDataType) {
      parseUSBTree(data.SPUSBDataType);
    }

    return devices;
  } catch (error) {
    console.error("macOS USB detection error:", error);
    return [];
  }
}

/**
 * Deteksi perangkat di Linux menggunakan lsusb
 */
async function detectLinuxDevices(): Promise<USBDevice[]> {
  try {
    const { stdout } = await execAsync("lsusb -v 2>/dev/null || lsusb");
    const devices: USBDevice[] = [];
    const lines = stdout.split("\n");

    for (const line of lines) {
      const match = line.match(/Bus \d+ Device \d+: ID ([0-9a-f]{4}):([0-9a-f]{4}) (.+)/i);
      if (match) {
        const [, vendorId, productId, description] = match;
        const parts = description.split(" ");
        const manufacturer = parts[0] || "Unknown";
        const product = parts.slice(1).join(" ") || "Unknown Device";

        devices.push({
          vendorId: vendorId.toLowerCase(),
          productId: productId.toLowerCase(),
          manufacturer,
          product,
          port: "",
          deviceType: detectDeviceType(vendorId.toLowerCase(), description),
        });
      }
    }

    // Coba dapatkan serial ports
    try {
      const { stdout: portStdout } = await execAsync("ls -la /dev/ttyUSB* /dev/ttyACM* 2>/dev/null || true");
      const ports = portStdout.split("\n").filter(l => l.includes("/dev/tty"));
      
      // Update port info jika ada
      ports.forEach((portLine, idx) => {
        if (devices[idx]) {
          const portMatch = portLine.match(/\/dev\/(tty[A-Z]+\d+)/);
          if (portMatch) {
            devices[idx].port = portMatch[1];
          }
        }
      });
    } catch {
      // Ignore port detection errors
    }

    return devices;
  } catch (error) {
    console.error("Linux USB detection error:", error);
    return [];
  }
}

/**
 * Deteksi perangkat di Windows menggunakan PowerShell
 */
async function detectWindowsDevices(): Promise<USBDevice[]> {
  try {
    const { stdout } = await execAsync(
      'powershell "Get-PnpDevice -Class Ports | Where-Object {$_.Status -eq \'OK\'} | Select-Object FriendlyName, InstanceId | ConvertTo-Json"'
    );
    
    const data = JSON.parse(stdout);
    const devices: USBDevice[] = [];
    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      if (!item.FriendlyName || !item.InstanceId) continue;

      // Parse VID dan PID dari InstanceId
      const vidMatch = item.InstanceId.match(/VID_([0-9A-F]{4})/i);
      const pidMatch = item.InstanceId.match(/PID_([0-9A-F]{4})/i);
      const portMatch = item.FriendlyName.match(/\(COM(\d+)\)/);

      if (vidMatch && pidMatch) {
        const vendorId = vidMatch[1].toLowerCase();
        const productId = pidMatch[1].toLowerCase();

        devices.push({
          vendorId,
          productId,
          manufacturer: "Unknown",
          product: item.FriendlyName,
          port: portMatch ? `COM${portMatch[1]}` : "",
          deviceType: detectDeviceType(vendorId, item.FriendlyName),
        });
      }
    }

    return devices;
  } catch (error) {
    console.error("Windows USB detection error:", error);
    return [];
  }
}

/**
 * Deteksi tipe device berdasarkan vendor ID dan nama
 */
function detectDeviceType(vendorId: string, name: string): string {
  const nameLower = name.toLowerCase();

  if (vendorId === "10c4" || vendorId === "303a" || nameLower.includes("esp32") || nameLower.includes("esp8266")) {
    return "ESP32/ESP8266";
  }
  if (vendorId === "2341" || nameLower.includes("arduino")) {
    return "Arduino";
  }
  if (vendorId === "2e8a" || nameLower.includes("raspberry pi pico")) {
    return "Raspberry Pi Pico";
  }
  if (nameLower.includes("raspberry pi") || nameLower.includes("rpi")) {
    return "Raspberry Pi";
  }
  if (vendorId === "0483" || nameLower.includes("stm32")) {
    return "STM32";
  }
  if (vendorId === "16c0" || nameLower.includes("teensy")) {
    return "Teensy";
  }
  if (vendorId === "1a86" || nameLower.includes("ch340")) {
    return "Arduino Clone (CH340)";
  }

  return "IoT Device";
}

/**
 * Cek apakah device adalah IoT device (bukan camera/mic/dll)
 */
function isIoTDevice(device: USBDevice): boolean {
  const nameLower = device.product.toLowerCase();
  const manufacturerLower = device.manufacturer.toLowerCase();

  // Cek apakah termasuk perangkat yang diabaikan
  for (const ignored of IGNORED_DEVICES) {
    if (nameLower.includes(ignored) || manufacturerLower.includes(ignored)) {
      return false;
    }
  }

  // Cek vendor ID
  if (IOT_VENDOR_IDS.includes(device.vendorId)) {
    return true;
  }

  // Cek nama vendor/manufacturer
  for (const iotName of IOT_VENDOR_NAMES) {
    if (nameLower.includes(iotName) || manufacturerLower.includes(iotName)) {
      return true;
    }
  }

  return false;
}
