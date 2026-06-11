"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle, Flame, AlertTriangle, WifiOff, Thermometer, Filter, RefreshCw, MapPin, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import type { Alert, Device } from "@/types";
import { DeviceMap } from "@/components/maps/device-map";

export function AlertsView() {
  const [severity, setSeverity] = useState("all");
  const [resolved, setResolved] = useState("all");
  const [page, setPage] = useState(0);
  const [devices, setDevices] = useState<Device[]>([]);
  const limit = 20;

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

  const fetchAlerts = useCallback(async () => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
    if (severity !== "all") params.set("severity", severity);
    if (resolved !== "all") params.set("resolved", resolved);

    const res = await fetch(`/api/alerts?${params}`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch alerts');
    return { alerts: data.data.alerts as Alert[], total: data.data.total as number };
  }, [severity, resolved, page]);

  const { data, loading, lastUpdated, refetch } = useRealtimeData({
    fetchFn: fetchAlerts,
    interval: 5000, // 5 seconds
  });

  const alerts = data?.alerts || [];
  const total = data?.total || 0;

  const resolveAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Alert resolved");
        refetch(); // Use refetch instead of fetchAlerts
      }
    } catch {
      toast.error("Failed to resolve alert");
    }
  };

  const getSeverityColor = (s: string) => {
    if (s === "critical") return "bg-red-500";
    if (s === "danger") return "bg-red-400";
    if (s === "warning") return "bg-amber-400";
    return "bg-blue-400";
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "fire_detected": return <Flame className="w-4 h-4 text-red-500" />;
      case "high_temperature": return <Thermometer className="w-4 h-4 text-amber-500" />;
      case "device_offline": return <WifiOff className="w-4 h-4 text-gray-500" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleExportCSV = () => {
    if (alerts.length === 0) {
      toast.error("No alerts to export");
      return;
    }
    
    // Create CSV header
    const headers = ["ID,Time,Device,Message,Severity,Type,Resolved"];
    
    // Create CSV rows
    const rows = alerts.map(alert => {
      return [
        alert.id,
        new Date(alert.createdAt).toLocaleString().replace(/,/g, ''),
        alert.device?.deviceName || "Unknown",
        `"${alert.message.replace(/"/g, '""')}"`,
        alert.severity,
        alert.alertType,
        alert.resolved ? "Yes" : "No"
      ].join(",");
    });
    
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `alerts-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Alerts exported successfully");
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && page === 0) return <AlertsSkeleton />;

  return (
    <div className="space-y-4">
      {/* Real-time indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Live • Updated {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'just now'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-7 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20"
          >
            <Download className="w-3 h-3 mr-1" />
            Export CSV
          </Button>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">All Alerts</h3>
          <p className="text-sm text-muted-foreground">{total} total alerts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(0); }}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="danger">Danger</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resolved} onValueChange={(v) => { setResolved(v); setPage(0); }}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="false">Unresolved</SelectItem>
            <SelectItem value="true">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Layout Grid: Map and List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Device Map */}
        <div className="order-2 lg:order-1">
          <Card className="h-full min-h-[400px] lg:h-[calc(100vh-220px)] flex flex-col">
            <div className="p-3 border-b flex items-center gap-2 font-medium text-sm flex-shrink-0">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Alert Locations
            </div>
            <div className="flex-1 overflow-hidden">
              <DeviceMap 
                devices={devices} 
                alerts={alerts} 
                showTooltipOnly={true} 
                noWrapper={true} 
              />
            </div>
          </Card>
        </div>

        {/* Alert List */}
        <div className="order-1 lg:order-2 flex flex-col h-[600px] lg:h-[calc(100vh-220px)]">
          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
        {alerts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No alerts found</p>
            <p className="text-sm">Great job! No alerts match your filters.</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
            >
              <Card className={`hover:shadow-sm transition-all ${alert.resolved ? "opacity-60" : ""}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`w-1 h-full min-h-[48px] rounded-full flex-shrink-0 ${getSeverityColor(alert.severity)}`} />
                  <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.alertType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${alert.resolved ? "line-through" : ""}`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">{alert.device?.deviceName}</span>
                      <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="text-[10px] h-4 px-1.5">
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {alert.alertType.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                    {!alert.resolved && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => resolveAlert(alert.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                      </Button>
                    )}
                    {alert.resolved && (
                      <Badge variant="outline" className="text-[10px] h-5 text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-800">
                        Resolved
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
          </div>
          
          {/* Pagination inside the list column */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2 border-t mt-2 pb-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 flex gap-3">
            <Skeleton className="w-1 h-12 rounded-full" />
            <Skeleton className="h-4 w-4" />
            <div className="flex-1">
              <Skeleton className="h-4 w-64 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
