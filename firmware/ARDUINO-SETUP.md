# 🔧 Arduino IDE Setup Guide - FireGuardAI ESP32

Panduan lengkap setup Arduino IDE untuk firmware ESP32 FireGuardAI.

---

## 📋 Table of Contents

- [Install Arduino IDE](#1-install-arduino-ide)
- [Install ESP32 Board Support](#2-install-esp32-board-support)
- [Install Required Libraries](#3-install-required-libraries)
- [Configure Arduino IDE](#4-configure-arduino-ide)
- [Verify Installation](#5-verify-installation)
- [Troubleshooting](#troubleshooting)

---

## 1. Install Arduino IDE

### Download

**Arduino IDE 2.x (Recommended):**
- Website: https://www.arduino.cc/en/software
- Select your OS: Windows, macOS, or Linux

**Arduino IDE 1.8.x (Legacy - Still Works):**
- Download: https://www.arduino.cc/en/software/OldSoftwareReleases

### Installation

#### Windows

1. Download `.exe` installer
2. Run installer
3. Accept defaults (install drivers when prompted)
4. Launch Arduino IDE

#### macOS

1. Download `.dmg` file
2. Open `.dmg`
3. Drag Arduino IDE to Applications
4. Launch from Applications

#### Linux (Ubuntu/Debian)

```bash
# Via snap (recommended)
sudo snap install arduino

# Or download .AppImage
wget https://downloads.arduino.cc/arduino-ide/arduino-ide_2.x.x_Linux_64bit.AppImage
chmod +x arduino-ide_2.x.x_Linux_64bit.AppImage
./arduino-ide_2.x.x_Linux_64bit.AppImage
```

---

## 2. Install ESP32 Board Support

### Method 1: Via Board Manager (Recommended)

#### Step 1: Add ESP32 Board Manager URL

1. Open Arduino IDE
2. Go to **File** → **Preferences** (or **Arduino IDE** → **Settings** on Mac)
3. Find **Additional Board Manager URLs**
4. Add this URL:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
5. If there are existing URLs, separate with comma or click the window icon to add on new line
6. Click **OK**

#### Step 2: Install ESP32 Platform

1. Go to **Tools** → **Board** → **Boards Manager**
2. Search: `ESP32`
3. Find: **"esp32 by Espressif Systems"**
4. Click **Install** (wait ~5 minutes for download)
5. Close Boards Manager when done

**Recommended Version:** 2.0.14 or newer

---

## 3. Install Required Libraries

### Library List

| Library | Purpose | Required? |
|---------|---------|-----------|
| ArduinoJson | JSON parsing | ✅ **YES** |
| WiFi | WiFi connection | ✅ Built-in |
| HTTPClient | HTTP requests | ✅ Built-in |

### Install ArduinoJson

#### Method 1: Library Manager (Easiest)

1. Go to **Tools** → **Manage Libraries** (or **Ctrl+Shift+I**)
2. Search: `ArduinoJson`
3. Find: **"ArduinoJson by Benoit Blanchon"**
4. Select version: **6.21.0 or newer**
5. Click **Install**
6. Close Library Manager

#### Method 2: Manual Install

```bash
# 1. Download from GitHub
# https://github.com/bblanchon/ArduinoJson/releases/latest

# 2. Extract ZIP file

# 3. Move to Arduino libraries folder:
# Windows: Documents/Arduino/libraries/
# Mac: ~/Documents/Arduino/libraries/
# Linux: ~/Arduino/libraries/

# 4. Rename folder to: ArduinoJson (no version number)

# 5. Restart Arduino IDE
```

### Verify Library Installation

1. Go to **Sketch** → **Include Library**
2. Check if **ArduinoJson** appears in the list
3. If yes, ✅ successfully installed!

---

## 4. Configure Arduino IDE

### Board Configuration

1. **Select Board:**
   - Go to **Tools** → **Board** → **ESP32 Arduino** → **ESP32 Dev Module**

2. **Upload Speed:**
   - Go to **Tools** → **Upload Speed** → **115200** (default)
   - If upload fails, try: **921600** (faster) or **460800**

3. **CPU Frequency:**
   - Go to **Tools** → **CPU Frequency** → **240MHz (WiFi/BT)** (default)

4. **Flash Size:**
   - Go to **Tools** → **Flash Size** → **4MB (32Mb)** (default for most ESP32)

5. **Partition Scheme:**
   - Go to **Tools** → **Partition Scheme** → **Default 4MB with spiffs**

6. **Core Debug Level:**
   - Go to **Tools** → **Core Debug Level** → **None** (for production)
   - Use **Info** or **Debug** for troubleshooting

### Port Selection

#### Windows

1. Connect ESP32 via USB
2. Go to **Tools** → **Port**
3. Select: **COM3**, **COM4**, etc. (will show as "USB Serial Port")

**If no port appears:**
- Install CP210x or CH340 USB drivers
- Check Device Manager for COM port number

#### macOS

1. Connect ESP32 via USB
2. Go to **Tools** → **Port**
3. Select: **/dev/cu.usbserial-xxx** or **/dev/cu.SLAB_USBtoUART**

#### Linux

1. Connect ESP32 via USB
2. Go to **Tools** → **Port**
3. Select: **/dev/ttyUSB0** or **/dev/ttyACM0**

**If permission denied:**
```bash
sudo usermod -a -G dialout $USER
# Logout and login again
```

---

## 5. Verify Installation

### Test Compilation

1. Open example sketch:
   ```
   File → Examples → WiFi → WiFiScan
   ```

2. Click **Verify** (✓ button or Ctrl+R)

3. Should see:
   ```
   Compiling sketch...
   ...
   Sketch uses XXXX bytes (X%) of program storage space.
   Maximum is XXXXXX bytes.
   Global variables use XXXXX bytes (XX%) of dynamic memory.
   ```

4. ✅ If compilation succeeds, everything is set up correctly!

### Test Upload

1. Connect ESP32 via USB
2. Select correct Port (see above)
3. Click **Upload** (→ button or Ctrl+U)
4. Should see:
   ```
   Connecting........_____....._____
   Writing at 0x00001000... (X%)
   ...
   Hard resetting via RTS pin...
   ```
5. ✅ Upload successful!

6. Open **Serial Monitor** (🔍 button or Ctrl+Shift+M)
7. Set baud rate: **115200**
8. Should see WiFi networks being scanned

---

## 🐛 Troubleshooting

### Library Issues

#### Error: `ArduinoJson.h: No such file or directory`

**Solution:**
```
1. Tools → Manage Libraries
2. Search: ArduinoJson
3. Install: ArduinoJson v6.21.0+
4. Restart Arduino IDE
5. Try compile again
```

#### Error: Multiple libraries with same name

**Solution:**
```bash
# Remove duplicate libraries
# Windows: Documents/Arduino/libraries/
# Mac: ~/Documents/Arduino/libraries/
# Linux: ~/Arduino/libraries/

# Keep only one ArduinoJson folder
# Delete others or move to backup
```

---

### Board Issues

#### Error: `Board not found` or `esp32 not found`

**Solution:**
1. Check Board Manager URL is correct
2. Reinstall ESP32 platform:
   ```
   Tools → Board → Boards Manager
   Search: ESP32
   Uninstall → Install again
   ```
3. Restart Arduino IDE

#### Error: `A fatal error occurred: Failed to connect`

**Solution:**
```
1. Check USB cable (use data cable, not charging-only)
2. Check Port selection (Tools → Port)
3. Hold BOOT button on ESP32 during upload
4. Try slower upload speed (Tools → Upload Speed → 115200)
5. Press EN button after upload starts
```

---

### Port Issues

#### Windows: No COM port shown

**Solution:**
```
1. Install USB drivers:
   - CP210x: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
   - CH340: http://www.wch.cn/downloads/CH341SER_ZIP.html

2. Check Device Manager:
   - Ports (COM & LPT) → Should see COM port
   - If "Unknown Device", driver issue

3. Try different USB cable
4. Try different USB port
```

#### macOS: Permission Denied

**Solution:**
```bash
# Check if port detected
ls -l /dev/cu.*

# If exists but can't access:
sudo chmod 666 /dev/cu.usbserial-*

# Or add user to dialout group (requires logout):
sudo dseditgroup -o edit -a $USER -t user dialout
```

#### Linux: Permission Denied `/dev/ttyUSB0`

**Solution:**
```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER

# Or temporary fix:
sudo chmod 666 /dev/ttyUSB0

# Reboot or logout/login
```

---

### Compilation Issues

#### Error: `Compilation error: ...`

**Generic Solutions:**
1. Check all required libraries installed
2. Verify board selected (ESP32 Dev Module)
3. Update ESP32 platform to latest version
4. Clear build cache:
   - Arduino IDE 2.x: File → Preferences → Delete cache and restart
   - Arduino IDE 1.x: Delete temp folder manually

#### Error: `sketch too big`

**Solution:**
```
Tools → Partition Scheme → Huge APP (3MB No OTA/1MB SPIFFS)
```

#### Error: `region 'dram0_0_seg' overflowed`

**Solution:**
```
1. Reduce code size (remove Serial.print, debug code)
2. Change partition scheme (see above)
3. Optimize compiler: Tools → Core Debug Level → None
```

---

## 📚 Additional Resources

### Documentation
- [Arduino IDE Documentation](https://docs.arduino.cc/)
- [ESP32 Arduino Core](https://docs.espressif.com/projects/arduino-esp32/en/latest/)
- [ArduinoJson Documentation](https://arduinojson.org/)

### Downloads
- [Arduino IDE](https://www.arduino.cc/en/software)
- [ESP32 Board Package](https://github.com/espressif/arduino-esp32)
- [ArduinoJson Library](https://github.com/bblanchon/ArduinoJson)

### USB Drivers
- [CP210x Driver (Silicon Labs)](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
- [CH340 Driver](http://www.wch.cn/downloads/CH341SER_ZIP.html)
- [FTDI Driver](https://ftdichip.com/drivers/vcp-drivers/)

### Community
- [Arduino Forum](https://forum.arduino.cc/)
- [ESP32 Forum](https://www.esp32.com/)
- [r/esp32 (Reddit)](https://www.reddit.com/r/esp32/)

---

## ✅ Quick Checklist

Before uploading firmware, ensure:

- [ ] Arduino IDE installed (2.x or 1.8.x)
- [ ] ESP32 board support installed via Board Manager
- [ ] ArduinoJson library installed (v6.21.0+)
- [ ] Board selected: **ESP32 Dev Module**
- [ ] Port selected: **COM3** (Windows), **/dev/cu.usbserial-xxx** (Mac), **/dev/ttyUSB0** (Linux)
- [ ] USB cable connected (data cable, not charging-only)
- [ ] Example sketch compiles without errors
- [ ] Serial Monitor works (115200 baud)

---

## 🎯 Next Steps

After Arduino IDE setup is complete:

1. **Configure Firmware:**
   - See [firmware/esp32_fire_monitor_complete/README.md](esp32_fire_monitor_complete/README.md)

2. **Setup config.h:**
   ```bash
   cd firmware/esp32_fire_monitor_complete
   cp config.h.example config.h
   # Edit config.h with your WiFi & Server settings
   ```

3. **Upload Firmware:**
   - Open `esp32_fire_monitor_complete.ino`
   - Click Upload (Ctrl+U)
   - Monitor Serial output (Ctrl+Shift+M)

---

**Last Updated:** June 26, 2026

Need help? Check [Troubleshooting](#troubleshooting) or open an issue on GitHub.
