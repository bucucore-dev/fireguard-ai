// ===== User Types =====
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

// ===== Device Types =====
export type DeviceStatus = "online" | "offline";

export interface Device {
  id: string;
  deviceId: string;
  deviceName: string;
  apiKey: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: DeviceStatus;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sensorLogs: number;
    alerts: number;
  };
}

// ===== Sensor Log Types =====
export type StatusLevel = "normal" | "warning" | "danger";

export interface SensorLog {
  id: string;
  deviceId: string;
  temperature: number;
  humidity: number | null;
  flameDetected: boolean;
  gasLevel: number | null;
  statusLevel: StatusLevel;
  createdAt: string;
  device?: Device;

  // ISO/IEC 17025 Traceability Fields
  smokePercent: number | null;      // % kepekatan asap (gasADC/4095*100), null = warm-up
  flameAO: number | null;           // Raw ADC MH Flame sensor (0-4095)
  calibrationOffset: number | null; // Offset kalibrasi LM35 aktif saat pengukuran
  rackUnit: string | null;          // Posisi rack unit ("U01"-"U42")
  firmwareVersion: string | null;   // Versi firmware saat data dikirim
  dataSource: "device" | "cron";    // "device"=dari ESP32, "cron"=periodic normal snapshot
}

// ===== Alert Types =====
export type AlertType =
  | "fire_detected"
  | "high_temperature"
  | "device_offline"
  | "low_humidity"
  | "gas_leak"
  | "smoke_warning";

export type AlertSeverity = "info" | "warning" | "danger" | "critical";
export type SensorType = "temperature" | "smoke" | "flame";

export interface Alert {
  id: string;
  deviceId: string;
  alertType: AlertType;
  message: string;
  severity: AlertSeverity;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  device?: Device;

  // ISO/IEC 17025 Audit Trail Fields
  sensorValue: number | null;       // Nilai sensor aktual saat alarm terpicu
  thresholdValue: number | null;    // Nilai threshold yang dilanggar
  calibrationOffset: number | null; // Offset kalibrasi aktif saat alarm
  rackUnit: string | null;          // Rack unit yang memicu alarm
  sensorType: SensorType | null;    // Jenis sensor pemicu
}

// ===== ISO/IEC 17025 Thresholds =====
export interface ISOThresholds {
  tempNormal: { min: number; max: number }; // Normal: 18–27°C
  tempWarning: number;                       // Warning: >27°C
  tempDanger: number;                        // Danger: ≥57°C (Fixed Temp alarm)
  gasWarning: number;                        // Warning: ADC ≥1200 (~0.03%/m)
  gasDanger: number;                         // Danger:  ADC ≥2500 (~0.06%/m)
}

// ===== Dashboard Stats =====
export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  currentAvgTemp: number;
  currentSmokePercent: number | null; // Rata-rata % smoke dari semua device
  flameDetectedCount: number;
  totalAlertsToday: number;
  unresolvedAlerts: number;
  highestAlertSeverity: AlertSeverity;
  isoThresholds: ISOThresholds;        // Threshold ISO 17025 untuk referensi UI
  recentLogs: SensorLog[];
  recentAlerts: Alert[];
  temperatureHistory: TemperatureDataPoint[];
  alertFrequency: AlertFrequencyPoint[];
  deviceActivity: DeviceActivityPoint[];
}

// ===== API Request/Response Types =====
export interface DeviceDataPayload {
  device_id: string;
  api_key: string;
  temperature: number;
  flame_detected?: boolean;
  humidity?: number;
  timestamp?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AddDevicePayload {
  deviceName: string;
  deviceId: string;
  location?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===== Navigation Types =====
export type ViewType =
  | "dashboard"
  | "devices"
  | "device-detail"
  | "alerts"
  | "settings";

// ===== Chart Types =====
export interface TemperatureDataPoint {
  time: string;
  temperature: number;
  smokePercent?: number | null; // Optional: % smoke untuk dual-axis chart
}

export interface AlertFrequencyPoint {
  date: string;
  count: number;
}

export interface DeviceActivityPoint {
  deviceName: string;
  count: number;
}

export interface SmokeDataPoint {
  time: string;
  smokePercent: number;
}
