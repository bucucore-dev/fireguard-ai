"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Cpu, MapPin, Wifi, WifiOff, Clock, Database, AlertTriangle, Usb, RefreshCw, Copy, Check, Edit, Trash2, Eye, EyeOff, Key } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAppStore } from "@/stores/app-store";
import { AddDeviceDialog } from "@/components/devices/add-device-dialog";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import type { Device } from "@/types";

interface USBDevice {
  vendorId: string;
  productId: string;
  manufacturer: string;
  product: string;
  serialNumber?: string;
  port: string;
  deviceType: string;
}

interface SelectedUSBDevice extends USBDevice {
  suggestedName: string;
  suggestedId: string;
}

export function DevicesView() {
  const { setCurrentView } = useAppStore();
  const [usbDevices, setUsbDevices] = useState<USBDevice[]>([]);
  const [detectingUSB, setDetectingUSB] = useState(false);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [showUSBDevices, setShowUSBDevices] = useState(false);
  const [selectedUSBDevice, setSelectedUSBDevice] = useState<SelectedUSBDevice | null>(null);
  const [autoRegisterOpen, setAutoRegisterOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);

  const fetchDevices = useCallback(async () => {
    const res = await fetch(`/api/devices`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch devices');
    return data.data as Device[];
  }, []);

  const { data: devices = [], loading, lastUpdated, refetch } = useRealtimeData({
    fetchFn: fetchDevices,
    interval: 5000, // 5 seconds
  });

  const detectUSBDevices = async () => {
    setDetectingUSB(true);
    try {
      const res = await fetch(`/api/devices/detect-usb`);
      const data = await res.json();
      if (data.success) {
        setUsbDevices(data.data.devices);
        setShowUSBDevices(true);
      }
    } catch (error) {
      console.error("Failed to detect USB devices:", error);
    }
    setDetectingUSB(false);
  };

  const handleQuickRegister = (device: USBDevice) => {
    // Generate suggested name and ID
    const suggestedId = `${device.deviceType.replace(/[^a-zA-Z0-9]/g, "")}-${device.port.replace(/[^a-zA-Z0-9]/g, "")}`;
    const suggestedName = `${device.deviceType} (${device.port})`;
    
    setSelectedUSBDevice({
      ...device,
      suggestedName,
      suggestedId,
    });
    setAutoRegisterOpen(true);
  };

  const filtered = (devices || []).filter((d) =>
    d.deviceName.toLowerCase().includes(search.toLowerCase()) ||
    d.deviceId.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <DevicesSkeleton />;

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={detectUSBDevices}
            disabled={detectingUSB}
            className="border-orange-200 dark:border-orange-800"
          >
            {detectingUSB ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Usb className="w-4 h-4 mr-2" />
            )}
            Detect USB
          </Button>
          <Button onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      {/* USB Devices Detected */}
      {showUSBDevices && usbDevices.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Usb className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <h3 className="font-semibold text-sm">USB IoT Devices Detected</h3>
                  <p className="text-xs text-muted-foreground">
                    {usbDevices.length} device{usbDevices.length !== 1 ? "s" : ""} found connected via USB
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowUSBDevices(false)}
                className="h-7 text-xs"
              >
                Hide
              </Button>
            </div>
            <div className="space-y-2">
              {usbDevices.map((device, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{device.product}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{device.manufacturer}</span>
                        {device.port && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{device.port}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {device.deviceType}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleQuickRegister(device)}
                      className="h-8 text-xs"
                    >
                      Quick Register
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No USB Devices Found */}
      {showUSBDevices && usbDevices.length === 0 && (
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <Usb className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No IoT devices detected via USB
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Make sure your IoT device (ESP32, Arduino, Raspberry Pi) is connected
            </p>
          </CardContent>
        </Card>
      )}

      {/* Registered Devices Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Cpu className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No devices found</p>
          <p className="text-sm">Add a new IoT device to start monitoring</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((device, i) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-all hover:border-orange-300 dark:hover:border-orange-800"
                onClick={() => {
                  setSelectedDevice(device);
                  setDeviceModalOpen(true);
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.status === "online" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                        <Cpu className={`w-5 h-5 ${device.status === "online" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{device.deviceName}</h3>
                        <p className="text-xs text-muted-foreground">{device.deviceId}</p>
                      </div>
                    </div>
                    <Badge variant={device.status === "online" ? "default" : "secondary"} className={device.status === "online" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 hover:bg-emerald-100" : ""}>
                      {device.status === "online" ? <><Wifi className="w-3 h-3 mr-1" /> Online</> : <><WifiOff className="w-3 h-3 mr-1" /> Offline</>}
                    </Badge>
                  </div>

                  {device.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" />
                      {device.location}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {device._count?.sensorLogs || 0} logs
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {device._count?.alerts || 0} alerts
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {device.lastSeen
                        ? new Date(device.lastSeen).toLocaleDateString()
                        : "Never"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AddDeviceDialog open={addOpen} onClose={() => setAddOpen(false)} onAdded={fetchDevices} />
      <AutoRegisterDialog 
        open={autoRegisterOpen} 
        onClose={() => {
          setAutoRegisterOpen(false);
          setSelectedUSBDevice(null);
        }} 
        device={selectedUSBDevice}
        onRegistered={() => {
          fetchDevices();
          detectUSBDevices(); // Refresh USB list
        }}
      />
      <DeviceManagementModal
        open={deviceModalOpen}
        onClose={() => {
          setDeviceModalOpen(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice}
        onUpdated={() => {
          fetchDevices();
        }}
        onDeleted={() => {
          fetchDevices();
          setDeviceModalOpen(false);
          setSelectedDevice(null);
        }}
      />
    </div>
  );
}

function DevicesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start gap-2.5 mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-36 mb-3" />
              <div className="pt-3 border-t flex gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Auto-register dialog for USB detected devices
function AutoRegisterDialog({ 
  open, 
  onClose, 
  device, 
  onRegistered 
}: { 
  open: boolean; 
  onClose: () => void; 
  device: SelectedUSBDevice | null;
  onRegistered: () => void;
}) {
  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);

  // Auto-fill when device changes
  useEffect(() => {
    if (device) {
      setName(device.suggestedName);
      setDeviceId(device.suggestedId);
      setLocation(`USB Port: ${device.port}`);
    }
  }, [device]);

  const handleRegister = async () => {
    if (!name || !deviceId || !device) return;
    setLoading(true);

    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          deviceName: name, 
          deviceId, 
          location 
        }),
      });
      const data = await res.json();

      if (data.success) {
        setApiKey(data.data.apiKey);
        onRegistered();
      } else {
        alert(data.error || "Failed to register device");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDeviceId("");
    setLocation("");
    setApiKey("");
    setCopied(false);
    onClose();
  };

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {apiKey ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                Device Registered Successfully!
              </DialogTitle>
              <DialogDescription>
                Your device has been added to the monitoring system. Save the API key below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Label className="text-xs text-muted-foreground mb-2 block">Device Information</Label>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono text-xs">{deviceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{device.deviceType}</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                <Label className="text-xs font-semibold text-orange-900 dark:text-orange-400 mb-2 block">
                  🔑 API Key (Save this securely!)
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono break-all bg-white dark:bg-gray-900 p-2 rounded border">
                    {apiKey}
                  </code>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="flex-shrink-0 h-9 w-9" 
                    onClick={copyKey}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ You won't be able to see this key again. Copy it now!
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Usb className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Quick Register USB Device
              </DialogTitle>
              <DialogDescription>
                Confirm the details below to register this device to your monitoring system.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Device Info Card */}
              <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center flex-shrink-0">
                      <Cpu className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1">{device.product}</p>
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Type:</span>
                          <Badge variant="outline" className="text-xs h-5">
                            {device.deviceType}
                          </Badge>
                        </div>
                        <div><span className="font-medium">Manufacturer:</span> {device.manufacturer}</div>
                        <div><span className="font-medium">Port:</span> <code className="font-mono">{device.port}</code></div>
                        {device.serialNumber && (
                          <div><span className="font-medium">Serial:</span> <code className="font-mono text-[10px]">{device.serialNumber}</code></div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Fields */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="auto-name">Device Name</Label>
                  <Input 
                    id="auto-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g., Server Room Sensor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auto-id">Device ID</Label>
                  <Input 
                    id="auto-id" 
                    value={deviceId} 
                    onChange={(e) => setDeviceId(e.target.value)} 
                    placeholder="e.g., ESP32-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auto-location">Location (optional)</Label>
                  <Input 
                    id="auto-location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="e.g., Building A, Floor 2"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleRegister} 
                disabled={loading || !name || !deviceId}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Register Device
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Device Management Modal
function DeviceManagementModal({
  open,
  onClose,
  device,
  onUpdated,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  device: Device | null;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [deviceName, setDeviceName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Initialize form when device changes
  useEffect(() => {
    if (device) {
      setDeviceName(device.deviceName);
      setLocation(device.location || "");
      setLatitude(device.latitude?.toString() || "");
      setLongitude(device.longitude?.toString() || "");
      setIsEditing(false);
      setShowKey(false);
    }
  }, [device]);

  const copyKey = () => {
    if (device) {
      navigator.clipboard.writeText(device.apiKey);
      setCopied(true);
      toast.success("API Key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdate = async () => {
    if (!device) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/devices/${device.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName,
          location,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Device updated successfully");
        setIsEditing(false);
        onUpdated();
      } else {
        toast.error(data.error || "Failed to update device");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!device) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/devices/${device.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Device deleted successfully");
        onDeleted();
      } else {
        toast.error(data.error || "Failed to delete device");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${device.status === "online" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-gray-100 dark:bg-gray-800"}`}>
              <Cpu className={`w-5 h-5 ${device.status === "online" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
            </div>
            <div>
              <div className="font-bold">{device.deviceName}</div>
              <div className="text-xs text-muted-foreground font-normal">{device.deviceId}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Manage device settings, view API key, or delete device
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={device.status === "online" ? "default" : "secondary"} className={device.status === "online" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : ""}>
              {device.status === "online" ? <><Wifi className="w-3 h-3 mr-1" /> Online</> : <><WifiOff className="w-3 h-3 mr-1" /> Offline</>}
            </Badge>
            {device.lastSeen && (
              <span className="text-xs text-muted-foreground">
                Last seen: {new Date(device.lastSeen).toLocaleString()}
              </span>
            )}
          </div>

          <Separator />

          {/* API Key Section */}
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-orange-900 dark:text-orange-400 flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Key
              </Label>
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7" 
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7" 
                  onClick={copyKey}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
            <code className="text-xs font-mono break-all bg-white dark:bg-gray-900 p-2 rounded border block">
              {showKey ? device.apiKey : "••••••••••••••••••••••••••••••••"}
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Use this key to authenticate your IoT device
            </p>
          </div>

          <Separator />

          {/* Device Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Device Information</Label>
              {!isEditing && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Device Name</Label>
                  <Input 
                    id="edit-name" 
                    value={deviceName} 
                    onChange={(e) => setDeviceName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input 
                    id="edit-location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="e.g., Server Room A"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-lat">Latitude</Label>
                    <Input 
                      id="edit-lat" 
                      type="number"
                      step="0.000001"
                      value={latitude} 
                      onChange={(e) => setLatitude(e.target.value)} 
                      placeholder="-6.208800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lng">Longitude</Label>
                    <Input 
                      id="edit-lng" 
                      type="number"
                      step="0.000001"
                      value={longitude} 
                      onChange={(e) => setLongitude(e.target.value)} 
                      placeholder="106.845600"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{device.deviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs">{device.deviceId}</span>
                </div>
                {device.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{device.location}</span>
                  </div>
                )}
                {device.latitude && device.longitude && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latitude:</span>
                      <span className="font-mono text-xs">{device.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Longitude:</span>
                      <span className="font-mono text-xs">{device.longitude.toFixed(6)}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{device._count?.sensorLogs || 0}</div>
              <div className="text-xs text-muted-foreground">Sensor Logs</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{device._count?.alerts || 0}</div>
              <div className="text-xs text-muted-foreground">Alerts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {device.lastSeen ? new Date(device.lastSeen).toLocaleDateString() : "Never"}
              </div>
              <div className="text-xs text-muted-foreground">Last Seen</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isEditing ? (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  // Reset form
                  setDeviceName(device.deviceName);
                  setLocation(device.location || "");
                  setLatitude(device.latitude?.toString() || "");
                  setLongitude(device.longitude?.toString() || "");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={loading || !deviceName}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Device
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
                    <AlertDialogAction 
                      onClick={handleDelete} 
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
