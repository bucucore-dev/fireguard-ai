"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import type { Device, Alert } from "@/types";

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <MapLoadingSkeleton /> }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

function MapLoadingSkeleton() {
  return (
    <div className="h-[450px] flex items-center justify-center bg-muted rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

interface DeviceMapProps {
  devices: Device[];
  alerts: Alert[];
  onDeviceClick?: (deviceId: string) => void;
  showTooltipOnly?: boolean;
  noWrapper?: boolean; // New prop to render without Card wrapper
}

interface DeviceWithTemp extends Device {
  currentTemp?: number;
}

export function DeviceMap({ devices, alerts, onDeviceClick, showTooltipOnly = false, noWrapper = false }: DeviceMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);
  const [devicesWithTemp, setDevicesWithTemp] = useState<DeviceWithTemp[]>(devices);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  // Get current theme (dark or light)
  const currentTheme = mounted ? (resolvedTheme || theme) : 'light';
  const isDark = currentTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsClient(true);
    // Import Leaflet CSS and library
    import("leaflet/dist/leaflet.css");
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      
      // Fix default marker icon issue
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });
    });
  }, []);

  // Fetch latest temperature for each device
  useEffect(() => {
    const fetchTemperatures = async () => {
      const devicesWithTemps = await Promise.all(
        devices.map(async (device) => {
          try {
            const res = await fetch(`/api/sensor-logs?deviceId=${device.id}&limit=1`);
            const data = await res.json();
            if (data.success && data.data.logs && data.data.logs.length > 0) {
              return { ...device, currentTemp: data.data.logs[0].temperature };
            }
          } catch (error) {
            console.error(`Failed to fetch temp for ${device.id}:`, error);
          }
          return device;
        })
      );
      setDevicesWithTemp(devicesWithTemps);
    };

    if (devices.length > 0) {
      fetchTemperatures();
      // Refresh temperatures every 10 seconds
      const interval = setInterval(fetchTemperatures, 10000);
      return () => clearInterval(interval);
    } else {
      setDevicesWithTemp([]);
    }
  }, [devices]);

  // Filter devices with coordinates
  const devicesWithLocation = devicesWithTemp.filter(
    (d) => d.latitude !== null && d.longitude !== null
  );

  // Auto-cycle through devices if more than 1
  useEffect(() => {
    if (devicesWithLocation.length > 1 && mapInstance) {
      const interval = setInterval(() => {
        setCurrentDeviceIndex((prev) => (prev + 1) % devicesWithLocation.length);
      }, 5000); // Change device every 5 seconds

      return () => clearInterval(interval);
    }
  }, [devicesWithLocation.length, mapInstance]);

  // Pan to current device
  useEffect(() => {
    if (mapInstance && devicesWithLocation.length > 1) {
      const device = devicesWithLocation[currentDeviceIndex];
      if (device && device.latitude && device.longitude) {
        mapInstance.flyTo([device.latitude, device.longitude], 15, {
          duration: 2, // 2 seconds animation
        });
      }
    }
  }, [currentDeviceIndex, mapInstance, devicesWithLocation]);

  // Calculate center (average of all device locations or default)
  const center: [number, number] = devicesWithLocation.length > 0
    ? [
        devicesWithLocation.reduce((sum, d) => sum + (d.latitude || 0), 0) / devicesWithLocation.length,
        devicesWithLocation.reduce((sum, d) => sum + (d.longitude || 0), 0) / devicesWithLocation.length,
      ]
    : [-6.2088, 106.8456]; // Default: Jakarta, Indonesia

  // Get device status color
  const getDeviceColor = (device: Device) => {
    // Ensure alerts is an array
    if (!Array.isArray(alerts)) {
      return device.status === "offline" ? "#6b7280" : "#10b981";
    }
    
    const deviceAlerts = alerts.filter(
      (a) => a.deviceId === device.id && !a.resolved
    );
    
    if (deviceAlerts.some((a) => a.severity === "critical")) return "#ef4444"; // red
    if (deviceAlerts.some((a) => a.severity === "danger")) return "#f97316"; // orange
    if (deviceAlerts.some((a) => a.severity === "warning")) return "#eab308"; // yellow
    if (device.status === "offline") return "#6b7280"; // gray
    return "#10b981"; // green
  };

  // Create custom icon
  const createCustomIcon = (color: string) => {
    if (!L) return null;
    
    return new L.DivIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          "></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  // Tile layer URLs for light and dark themes
  const tileLayerUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileLayerAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  if (!isClient || !L || !mounted) {
    if (noWrapper) {
      return <MapLoadingSkeleton />;
    }
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Device Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MapLoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (devicesWithLocation.length === 0) {
    const emptyContent = (
      <div className="h-[450px] flex flex-col items-center justify-center bg-muted rounded-lg text-muted-foreground">
        <MapPin className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">No devices with location data</p>
        <p className="text-xs mt-1">Add location when registering devices</p>
      </div>
    );

    if (noWrapper) {
      return emptyContent;
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Device Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emptyContent}
        </CardContent>
      </Card>
    );
  }

  const mapContent = (
    <>
      <div className={`${noWrapper ? 'h-full' : 'h-[450px]'} overflow-hidden ${noWrapper ? '' : 'rounded-lg border'}`}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          key={`map-${isDark ? 'dark' : 'light'}`}
          whenCreated={setMapInstance}
        >
          <TileLayer
            attribution={tileLayerAttribution}
            url={tileLayerUrl}
          />
          
          {devicesWithLocation.map((device) => {
            const color = getDeviceColor(device);
            const icon = createCustomIcon(color);
            const deviceAlerts = Array.isArray(alerts) 
              ? alerts.filter((a) => a.deviceId === device.id && !a.resolved)
              : [];
            
            return (
              <Marker
                key={device.id}
                position={[device.latitude!, device.longitude!]}
                icon={icon!}
              >
                <Popup closeButton={!showTooltipOnly} autoClose={showTooltipOnly}>
                  <div className="p-2 min-w-[220px]">
                    <h3 className="font-semibold text-sm mb-1">{device.deviceName}</h3>
                    <p className="text-xs text-gray-600 mb-2">{device.location || "No location name"}</p>
                    
                    <div className="space-y-1.5 text-xs">
                      {/* Coordinates */}
                      <div className="pb-1.5 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Latitude:</span>
                          <span className="font-mono font-medium text-gray-900">{device.latitude?.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-gray-600">Longitude:</span>
                          <span className="font-mono font-medium text-gray-900">{device.longitude?.toFixed(6)}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${device.status === "online" ? "text-green-600" : "text-gray-600"}`}>
                          {device.status === "online" ? "🟢 Online" : "⚫ Offline"}
                        </span>
                      </div>

                      {/* Temperature - Get from latest sensor log */}
                      {device.currentTemp !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Temperature:</span>
                          <span className={`font-medium ${
                            device.currentTemp >= 60 ? "text-red-600" : 
                            device.currentTemp >= 40 ? "text-orange-600" : 
                            "text-green-600"
                          }`}>
                            🌡️ {device.currentTemp}°C
                          </span>
                        </div>
                      )}
                      
                      {deviceAlerts.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="font-medium text-red-600 mb-1">
                            🚨 {deviceAlerts.length} Active Alert{deviceAlerts.length > 1 ? "s" : ""}
                          </p>
                          {deviceAlerts.slice(0, 2).map((alert) => (
                            <p key={alert.id} className="text-xs text-gray-600 truncate">
                              • {alert.message}
                            </p>
                          ))}
                        </div>
                      )}
                      
                      {device.lastSeen && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Last seen:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(device.lastSeen).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!showTooltipOnly && (
                      <button
                        onClick={() => onDeviceClick?.(device.id)}
                        className="mt-3 w-full text-xs bg-orange-600 text-white py-1.5 rounded hover:bg-orange-700 transition-colors"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      
      {/* Legend - only show if not noWrapper */}
      {!noWrapper && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Danger</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Offline</span>
          </div>
        </div>
      )}
    </>
  );

  if (noWrapper) {
    return mapContent;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Device Locations ({devicesWithLocation.length} device{devicesWithLocation.length !== 1 ? 's' : ''})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mapContent}
      </CardContent>
    </Card>
  );
}
