"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Thermometer, Flame, Wifi, WifiOff, AlertTriangle,
  TrendingUp, Clock, ArrowRight, RefreshCw, Cpu,
  Droplets, Database, MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/stores/app-store";
import { TemperatureChart } from "@/components/charts/temperature-chart";
import { AlertChart } from "@/components/charts/alert-chart";
import { DeviceActivityChart } from "@/components/charts/device-activity-chart";
import { DeviceMap } from "@/components/maps/device-map";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import type { DashboardStats, Device, SensorLog } from "@/types";

export function DashboardView() {
  const { setCurrentView } = useAppStore();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("all");
  const [devices, setDevices] = useState<Device[]>([]);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  // Fetch devices list for selector
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch('/api/devices');
        const data = await res.json();
        if (data.success) {
          setDevices(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      }
    };
    fetchDevices();
  }, []);

  const fetchStats = useCallback(async () => {
    const url = selectedDeviceId === "all" 
      ? `/api/dashboard/stats?timeRange=${timeRange}`
      : `/api/dashboard/stats?deviceId=${selectedDeviceId}&timeRange=${timeRange}`;
    
    const res = await fetch(url);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch stats');
    return data.data as DashboardStats;
  }, [selectedDeviceId, timeRange]);

  const { data: stats, loading, lastUpdated, refetch } = useRealtimeData({
    fetchFn: fetchStats,
    interval: 5000, // 5 seconds
  });

  const isAllDevices = selectedDeviceId === "all";
  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  // If specific device is selected, show device detail view
  if (!loading && !isAllDevices && selectedDevice) {
    return <DeviceSpecificView 
      device={selectedDevice} 
      stats={stats} 
      lastUpdated={lastUpdated}
      refetch={refetch}
      devices={devices}
      selectedDeviceId={selectedDeviceId}
      setSelectedDeviceId={setSelectedDeviceId}
    />;
  }

  if (loading) return <DashboardSkeleton />;

  if (!stats) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Failed to load dashboard data</p>
      </div>
    );
  }

  const tempColor = stats.currentAvgTemp >= 60 ? "text-red-600 dark:text-red-400" : stats.currentAvgTemp >= 40 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
  const tempBg = stats.currentAvgTemp >= 60 ? "bg-red-50 dark:bg-red-950/20" : stats.currentAvgTemp >= 40 ? "bg-amber-50 dark:bg-amber-950/20" : "bg-emerald-50 dark:bg-emerald-950/20";

  const kpiCards = [
    {
      title: "Avg Temperature",
      value: `${stats.currentAvgTemp}°C`,
      icon: Thermometer,
      color: tempColor,
      bg: tempBg,
      subtitle: "Across all devices",
    },
    {
      title: "Flame Detection",
      value: stats.flameDetectedCount > 0 ? `${stats.flameDetectedCount} Active` : "Clear",
      icon: Flame,
      color: stats.flameDetectedCount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400",
      bg: stats.flameDetectedCount > 0 ? "bg-red-50 dark:bg-red-950/20" : "bg-emerald-50 dark:bg-emerald-950/20",
      subtitle: stats.flameDetectedCount > 0 ? "Immediate action required" : "No flames detected",
      pulse: stats.flameDetectedCount > 0,
    },
    {
      title: "Device Status",
      value: `${stats.onlineDevices}/${stats.totalDevices}`,
      icon: stats.onlineDevices > 0 ? Wifi : WifiOff,
      color: stats.onlineDevices === stats.totalDevices ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
      bg: stats.onlineDevices === stats.totalDevices ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-amber-50 dark:bg-amber-950/20",
      subtitle: `${stats.offlineDevices} device${stats.offlineDevices !== 1 ? "s" : ""} offline`,
    },
    {
      title: "Alerts Today",
      value: String(stats.totalAlertsToday),
      icon: AlertTriangle,
      color: stats.totalAlertsToday > 10 ? "text-red-600 dark:text-red-400" : stats.totalAlertsToday > 5 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400",
      bg: stats.totalAlertsToday > 10 ? "bg-red-50 dark:bg-red-950/20" : stats.totalAlertsToday > 5 ? "bg-amber-50 dark:bg-amber-950/20" : "bg-emerald-50 dark:bg-emerald-950/20",
      subtitle: `${stats.unresolvedAlerts} unresolved`,
    },
  ];

  const severityVariant = (s: string) => {
    if (s === "critical" || s === "danger") return "destructive" as const;
    if (s === "warning") return "outline" as const;
    return "secondary" as const;
  };

  return (
    <div className="space-y-4">
      {/* Header with Device Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAllDevices ? "Overview of all devices" : `Monitoring ${selectedDevice?.deviceName}`}
          </p>
        </div>
        
        {/* Device Selector & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Live • {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'now'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-8 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
          
          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
            <SelectTrigger className="w-[200px] h-8">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" />
                <SelectValue placeholder="Select device" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>All Devices</span>
                </div>
              </SelectItem>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  <div className="flex items-center gap-2">
                    {device.status === "online" ? (
                      <Wifi className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span>{device.deviceName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Layout: Map (Left 70%) + KPI Cards (Right 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-4">
        {/* Map - Takes 7 columns (70%) - Full edge-to-edge */}
        <div className="lg:col-span-7 h-[450px]">
          <div className="h-full rounded-lg overflow-hidden border border-border">
            <DeviceMap 
              devices={isAllDevices ? devices : selectedDevice ? [selectedDevice] : []} 
              alerts={stats.recentAlerts || []}
              showTooltipOnly={true}
              noWrapper={true}
            />
          </div>
        </div>

        {/* KPI Cards - Takes 3 columns (30%) - Compact vertical stack */}
        <div className="lg:col-span-3 flex flex-col gap-2 h-[450px]">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex-1 min-h-0"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-2.5 flex flex-col justify-center h-full">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${card.bg} flex-shrink-0`}>
                      <card.icon className={`w-3.5 h-3.5 ${card.color} ${card.pulse ? "animate-pulse-danger" : ""}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold leading-none">{card.value}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{card.title}</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1.5 leading-tight">{card.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Temperature History - Full Width Below Map */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Temperature History ({timeRange === "24h" ? "24 Hours" : timeRange === "7d" ? "7 Days" : "30 Days"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TemperatureChart data={stats.temperatureHistory} />
        </CardContent>
      </Card>

      {/* Bottom Row: Alert Chart and Device Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              Alert Frequency ({timeRange === "24h" ? "24 Hours" : timeRange === "7d" ? "7 Days" : "30 Days"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertChart data={stats.alertFrequency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="w-4 h-4 text-muted-foreground" />
              Alerts by Device
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceActivityChart data={stats.deviceActivity} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recent Alerts
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setCurrentView("alerts")}>
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
            {stats.recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent alerts</p>
            ) : (
              stats.recentAlerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === "critical" ? "bg-red-500 animate-pulse-danger" : alert.severity === "danger" ? "bg-red-500" : alert.severity === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{alert.device?.deviceName}</span>
                      <Badge variant={severityVariant(alert.severity)} className="text-[10px] h-4 px-1.5">
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Device-specific view (similar to device detail but without API key)
function DeviceSpecificView({ 
  device, 
  stats, 
  lastUpdated, 
  refetch,
  devices,
  selectedDeviceId,
  setSelectedDeviceId,
}: { 
  device: Device; 
  stats: DashboardStats | null; 
  lastUpdated: Date | null;
  refetch: () => void;
  devices: Device[];
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
}) {
  const { setCurrentView } = useAppStore();

  if (!stats) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Failed to load device data</p>
      </div>
    );
  }

  const latestLog = stats.recentLogs[0];
  const tempChartData = [...stats.recentLogs].reverse().map((log: SensorLog) => ({
    time: new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    temperature: log.temperature,
  }));

  const severityVariant = (s: string) => {
    if (s === "critical" || s === "danger") return "destructive" as const;
    if (s === "warning") return "outline" as const;
    return "secondary" as const;
  };

  return (
    <div className="space-y-6">
      {/* Header with Device Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoring {device.deviceName}
          </p>
        </div>
        
        {/* Device Selector */}
        <div className="flex items-center gap-3">
          <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
            <SelectTrigger className="w-[220px]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <SelectValue placeholder="Select device" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>All Devices</span>
                </div>
              </SelectItem>
              {devices.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  <div className="flex items-center gap-2">
                    {d.status === "online" ? (
                      <Wifi className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span>{d.deviceName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Live • Updated {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'just now'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="h-7 text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Device Header Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${device.status === "online" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <Cpu className={`w-6 h-6 ${device.status === "online" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{device.deviceName}</h2>
                  <p className="text-sm text-muted-foreground">{device.deviceId}</p>
                  {device.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {device.location}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={device.status === "online" ? "default" : "secondary"} className={device.status === "online" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : ""}>
                  {device.status === "online" ? <><Wifi className="w-3 h-3 mr-1" /> Online</> : <><WifiOff className="w-3 h-3 mr-1" /> Offline</>}
                </Badge>
              </div>
            </div>

            {device.lastSeen && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> Last seen: {new Date(device.lastSeen).toLocaleString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Readings */}
      {latestLog && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Thermometer className={`w-8 h-8 ${latestLog.temperature >= 60 ? "text-red-500" : latestLog.temperature >= 40 ? "text-amber-500" : "text-emerald-500"}`} />
                <div>
                  <p className="text-2xl font-bold">{latestLog.temperature}°C</p>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Droplets className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{latestLog.humidity ?? "—"}%</p>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Flame className={`w-8 h-8 ${latestLog.flameDetected ? "text-red-500 animate-pulse-danger" : "text-emerald-500"}`} />
                <div>
                  <p className="text-2xl font-bold">{latestLog.flameDetected ? "Detected" : "Clear"}</p>
                  <p className="text-xs text-muted-foreground">Flame Status</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Main Layout: Map (Left 70%) + Recent Logs (Right 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-4">
        {/* Map - Takes 7 columns (70%) - Only if device has coordinates - Full edge-to-edge */}
        {device.latitude && device.longitude && (
          <div className="lg:col-span-7 h-[450px]">
            <div className="h-full rounded-lg overflow-hidden border border-border">
              <DeviceMap 
                devices={[device]} 
                alerts={stats.recentAlerts || []}
                showTooltipOnly={true}
                noWrapper={true}
              />
            </div>
          </div>
        )}

        {/* Recent Sensor Logs - Takes 3 columns (30%) or full width if no map */}
        <div className={device.latitude && device.longitude ? "lg:col-span-3" : "lg:col-span-10"}>
          <Card className="h-[450px] flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" /> Recent Sensor Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto custom-scrollbar">
                {stats.recentLogs.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground text-center">No logs yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {stats.recentLogs.map((log: SensorLog) => (
                      <div key={log.id} className="flex items-center justify-between py-2 px-2 text-sm border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`text-[10px] ${log.statusLevel === "danger" ? "border-red-300 text-red-600 dark:text-red-400" : log.statusLevel === "warning" ? "border-amber-300 text-amber-600 dark:text-amber-400" : "border-emerald-300 text-emerald-600 dark:text-emerald-400"}`}>
                            {log.statusLevel}
                          </Badge>
                          <span>{log.temperature}°C</span>
                          <span className="text-muted-foreground">{log.humidity ?? "—"}%</span>
                          {log.flameDetected && <Flame className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Temperature Chart - Full Width Below Map */}
      {tempChartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Temperature History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TemperatureChart data={tempChartData} />
          </CardContent>
        </Card>
      )}

      {/* Bottom Row: Recent Alerts - Full Width */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recent Alerts
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setCurrentView("alerts")}>
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
            {stats.recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent alerts</p>
            ) : (
              stats.recentAlerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === "critical" ? "bg-red-500 animate-pulse-danger" : alert.severity === "danger" ? "bg-red-500" : alert.severity === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={severityVariant(alert.severity)} className="text-[10px] h-4 px-1.5">
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="w-10 h-10 rounded-xl mb-3" />
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-6"><Skeleton className="h-[250px] w-full" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-[250px] w-full" /></CardContent></Card>
      </div>
    </div>
  );
}
