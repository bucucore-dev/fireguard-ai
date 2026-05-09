"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Cpu, MapPin, Wifi, WifiOff, Clock, Key, Eye, EyeOff, Copy, Check,
  Trash2, Thermometer, Droplets, Flame, Database, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/stores/app-store";
import { TemperatureChart } from "@/components/charts/temperature-chart";
import { DeviceMap } from "@/components/maps/device-map";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { toast } from "sonner";
import type { Device, SensorLog, Alert } from "@/types";

interface DeviceDetailData {
  device: Device;
  recentLogs: SensorLog[];
  recentAlerts: Alert[];
}

export function DeviceDetailView() {
  const { selectedDeviceId, setCurrentView } = useAppStore();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, loading, lastUpdated, refetch } = useRealtimeData({
    fetchFn: async () => {
      if (!selectedDeviceId) throw new Error('No device selected');
      
      const res = await fetch(`/api/devices/${selectedDeviceId}`);
      const data = await res.json();
      if (!data.success) throw new Error('Failed to fetch device');
      
      return {
        device: data.data.device,
        recentLogs: data.data.recentLogs || [],
        recentAlerts: data.data.recentAlerts || [],
      } as DeviceDetailData;
    },
    interval: 5000, // 5 seconds
    enabled: !!selectedDeviceId,
  });

  const device = data?.device || null;
  const recentLogs = data?.recentLogs || [];
  const recentAlerts = data?.recentAlerts || [];

  const deleteDevice = async () => {
    try {
      const res = await fetch(`/api/devices/${selectedDeviceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Device deleted successfully");
        setCurrentView("devices");
      } else {
        toast.error(data.error || "Failed to delete device");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const copyKey = () => {
    if (device) {
      navigator.clipboard.writeText(device.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <DeviceDetailSkeleton />;

  if (!device) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Cpu className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Device not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setCurrentView("devices")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Devices
        </Button>
      </div>
    );
  }

  const latestLog = recentLogs[0];
  const tempChartData = [...recentLogs].reverse().map((log) => ({
    time: new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    temperature: log.temperature,
  }));

  return (
    <div className="space-y-6">
      {/* Real-time indicator */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setCurrentView("devices")} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Devices
        </Button>
        <div className="flex items-center gap-3">
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
      </div>

      {/* Device Header */}
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="h-8">
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Device</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &quot;{device.deviceName}&quot; and all its sensor data and alerts. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteDevice} className="bg-destructive text-white hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <Separator className="my-4" />

            {/* API Key */}
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">API Key:</span>
              <code className="text-xs font-mono flex-1">
                {showKey ? device.apiKey : "••••••••••••••••••••••••••••••••"}
              </code>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyKey}>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {device.lastSeen && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Clock className="w-3 h-3" /> Last seen: {new Date(device.lastSeen).toLocaleString()}
              </div>
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

      {/* Map and Temperature Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Device Location Map */}
        {device.latitude && device.longitude && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <DeviceMap 
              devices={[device]} 
              alerts={recentAlerts || []}
              showTooltipOnly={true}
            />
          </motion.div>
        )}

        {/* Temperature Chart */}
        {tempChartData.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Temperature History</CardTitle>
              </CardHeader>
              <CardContent>
                <TemperatureChart data={tempChartData} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Recent Logs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" /> Recent Sensor Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No logs yet</p>
              ) : (
                <div className="space-y-1">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-2 px-2 text-sm border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[10px] ${log.statusLevel === "danger" ? "border-red-300 text-red-600 dark:text-red-400" : log.statusLevel === "warning" ? "border-amber-300 text-amber-600 dark:text-amber-400" : "border-emerald-300 text-emerald-600 dark:text-emerald-400"}`}>
                          {log.statusLevel}
                        </Badge>
                        <span>{log.temperature}°C</span>
                        <span className="text-muted-foreground">{log.humidity ?? "—"}%</span>
                        {log.flameDetected && <Flame className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function DeviceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>)}
      </div>
      <Card><CardContent className="p-6"><Skeleton className="h-[250px] w-full" /></CardContent></Card>
    </div>
  );
}
