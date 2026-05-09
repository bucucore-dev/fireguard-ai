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
  statusLevel: StatusLevel;
  createdAt: string;
  device?: Device;
}

// ===== Alert Types =====
export type AlertType = "fire_detected" | "high_temperature" | "device_offline" | "low_humidity";
export type AlertSeverity = "info" | "warning" | "danger" | "critical";

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
}

// ===== Dashboard Stats =====
export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  currentAvgTemp: number;
  flameDetectedCount: number;
  totalAlertsToday: number;
  unresolvedAlerts: number;
  recentLogs: SensorLog[];
  recentAlerts: Alert[];
  temperatureHistory: { time: string; temperature: number }[];
  alertFrequency: { date: string; count: number }[];
  deviceActivity: { deviceName: string; count: number }[];
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
}

export interface AlertFrequencyPoint {
  date: string;
  count: number;
}

export interface DeviceActivityPoint {
  deviceName: string;
  count: number;
}
