"use client";

import { useEffect, useState, useRef } from "react";
import { AlertTriangle, Flame, X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

interface Alert {
  id: string;
  type: string;
  severity: "info" | "warning" | "danger" | "critical";
  message: string;
  resolved: boolean;
  createdAt: string;
  device?: {
    deviceName: string;
  };
}

export function EmergencyModal() {
  const { setCurrentView } = useAppStore();
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [muted, setMuted] = useState(false);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for the alarm
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`/api/alerts?resolved=false&limit=5`);
        const data = await res.json();
        
        if (!cancelled && data.success && data.data.alerts) {
          // Filter for only warning/danger/critical
          const importantAlerts = data.data.alerts.filter((a: Alert) => 
            ["warning", "danger", "critical"].includes(a.severity)
          );
          setActiveAlerts(importantAlerts);
        }
      } catch (error) {
        console.error("Failed to fetch alerts for modal", error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Determine if we should show the modal
  // Filter out alerts that the user has temporarily dismissed
  const visibleAlerts = activeAlerts.filter(a => !dismissedAlertIds.has(a.id));
  
  // Find the highest severity among visible alerts
  const isDanger = visibleAlerts.some(a => ["danger", "critical"].includes(a.severity));
  const isWarning = visibleAlerts.some(a => a.severity === "warning");
  
  const showModal = visibleAlerts.length > 0;

  // Handle audio play/pause based on modal visibility and mute state
  useEffect(() => {
    if (showModal && isDanger && !muted) {
      // Browsers may block autoplay if no user interaction has occurred
      audioRef.current?.play().catch(e => console.log("Audio autoplay blocked by browser", e));
    } else {
      audioRef.current?.pause();
      if (audioRef.current) {
         audioRef.current.currentTime = 0;
      }
    }
  }, [showModal, isDanger, muted]);

  if (!showModal) return null;

  const handleDismiss = () => {
    // Dismiss currently visible alerts
    const newDismissed = new Set(dismissedAlertIds);
    visibleAlerts.forEach(a => newDismissed.add(a.id));
    setDismissedAlertIds(newDismissed);
  };

  const primaryAlert = visibleAlerts[0];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2 animate-in zoom-in-95 duration-300 ${
          isDanger 
            ? "border-red-500 bg-red-950/90 text-red-50 shadow-red-500/50" 
            : "border-amber-500 bg-amber-950/90 text-amber-50 shadow-amber-500/50"
        }`}
      >
        {/* Header */}
        <div className={`p-4 flex items-center gap-3 border-b ${isDanger ? 'border-red-900/50 bg-red-900/50' : 'border-amber-900/50 bg-amber-900/50'}`}>
          <div className={`p-2 rounded-full ${isDanger ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-amber-950 animate-pulse'}`}>
            {isDanger ? <Flame className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">
              {isDanger ? "EMERGENCY ALERT" : "WARNING ALERT"}
            </h2>
            <p className={`text-xs ${isDanger ? 'text-red-200' : 'text-amber-200'}`}>
              {visibleAlerts.length} active issue{visibleAlerts.length > 1 ? 's' : ''} detected
            </p>
          </div>
          
          <button 
            onClick={() => setMuted(!muted)}
            className={`p-2 rounded-full hover:bg-black/20 transition-colors ${!isDanger ? 'hidden' : ''}`}
            title={muted ? "Unmute Alarm" : "Mute Alarm"}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-xl">{primaryAlert.device?.deviceName || "Unknown Device"}</h3>
            <p className="text-lg opacity-90">{primaryAlert.message}</p>
          </div>
          
          <div className={`p-3 rounded-lg text-sm font-mono ${isDanger ? 'bg-red-900/40 text-red-200' : 'bg-amber-900/40 text-amber-200'}`}>
            Time: {new Date(primaryAlert.createdAt).toLocaleString()}
          </div>
          
          {visibleAlerts.length > 1 && (
            <p className={`text-sm italic ${isDanger ? 'text-red-300' : 'text-amber-300'}`}>
              + {visibleAlerts.length - 1} other alert(s). Check the Alerts tab for details.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 flex gap-3 ${isDanger ? 'bg-red-950' : 'bg-amber-950'}`}>
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className={`flex-1 ${
              isDanger 
                ? 'border-red-700 hover:bg-red-900 hover:text-white text-red-200 bg-transparent' 
                : 'border-amber-700 hover:bg-amber-900 hover:text-white text-amber-200 bg-transparent'
            }`}
          >
            Dismiss Temporarily
          </Button>
          <Button 
            className={`flex-1 ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
            onClick={() => {
              setCurrentView("alerts" as any);
              handleDismiss();
            }}
          >
            Go to Alerts
          </Button>
        </div>
      </div>
    </div>
  );
}
