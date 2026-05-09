"use client";

import { useState } from "react";
import { Plus, Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddDeviceDialog({ open, onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [createdKey, setCreatedKey] = useState("");
  const [copied, setCopied] = useState(false);

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // EPSG:4326 (WGS 84) format: [latitude, longitude]
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        
        toast.success(`Location detected: ${lat.toFixed(6)}°, ${lng.toFixed(6)}°`);
        setDetectingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Failed to detect location";
        
        if (error.code === 1) {
          errorMessage = "Location permission denied";
        } else if (error.code === 2) {
          errorMessage = "Location unavailable";
        } else if (error.code === 3) {
          errorMessage = "Location timeout";
        }
        
        toast.error(errorMessage + ". Please enter manually.");
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !deviceId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          deviceName: name, 
          deviceId, 
          location,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setCreatedKey(data.data.apiKey);
        toast.success("Device added successfully!");
        onAdded();
      } else {
        toast.error(data.error || "Failed to add device");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDeviceId("");
    setLocation("");
    setLatitude("");
    setLongitude("");
    setCreatedKey("");
    setCopied(false);
    onClose();
  };

  const copyKey = () => {
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Device Created Successfully!</DialogTitle>
              <DialogDescription>
                Save this API key securely. You will not be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted p-4 rounded-lg">
              <Label className="text-xs text-muted-foreground mb-1 block">API Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono break-all">{createdKey}</code>
                <Button size="icon" variant="outline" className="flex-shrink-0 h-8 w-8" onClick={copyKey}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
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
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>Register a new IoT device (ESP32, Arduino, Raspberry Pi, etc.) to your monitoring system.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dev-name">Device Name</Label>
                <Input id="dev-name" placeholder="e.g., Server Room C" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dev-id">Device ID</Label>
                <Input id="dev-id" placeholder="e.g., ESP32-005" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dev-location">Location (optional)</Label>
                <Input id="dev-location" placeholder="e.g., Building D, Floor 3" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              
              {/* Coordinates Section */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Coordinates (optional)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectCurrentLocation}
                    disabled={detectingLocation}
                    className="h-8 text-xs"
                  >
                    {detectingLocation ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3 mr-1" />
                        Auto Detect
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="dev-lat" className="text-xs text-muted-foreground">
                      Latitude (Lintang)
                    </Label>
                    <Input 
                      id="dev-lat" 
                      type="number" 
                      step="0.000001"
                      placeholder="-6.208800" 
                      value={latitude} 
                      onChange={(e) => setLatitude(e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Range: -90 to +90
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dev-lng" className="text-xs text-muted-foreground">
                      Longitude (Bujur)
                    </Label>
                    <Input 
                      id="dev-lng" 
                      type="number" 
                      step="0.000001"
                      placeholder="106.845600" 
                      value={longitude} 
                      onChange={(e) => setLongitude(e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Range: -180 to +180
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-2 rounded text-[10px] text-muted-foreground">
                  <p className="font-medium mb-1">📍 Format: EPSG:4326 (WGS 84)</p>
                  <p>• Copy dari Google Maps: Klik kanan → koordinat</p>
                  <p>• Indonesia: Lat negative (-6.xxx), Lng positive (106.xxx)</p>
                  <p>• Precision: 6 decimals (±0.11m accuracy)</p>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Add Device
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
