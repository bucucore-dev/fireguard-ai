"use client";

import { useState, useEffect } from "react";
import {
  Thermometer, Bell, Webhook, Mail, MessageCircle, Phone, Info, Save, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function SettingToggle({
  icon: Icon, label, description, checked, onCheckedChange, badge, disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            {badge && <Badge variant="outline" className="text-[10px] h-4 px-1.5">{badge}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

export function SettingsView() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState(60);
  const [dangerThreshold, setDangerThreshold] = useState(80);
  const [notifications, setNotifications] = useState({
    email: false,
    telegram: false,
    whatsapp: false,
    push: true,
  });

  // Load settings from API
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        
        const data = await res.json();
        
        setWarningThreshold(parseInt(data.tempWarningThreshold));
        setDangerThreshold(parseInt(data.tempDangerThreshold));
        setNotifications({
          email: data.emailNotifications === "true",
          telegram: data.telegramNotifications === "true",
          whatsapp: data.whatsappNotifications === "true",
          push: data.pushNotifications === "true",
        });
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings. Using defaults.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [toast]);

  // Save settings to API
  const saveSettings = async () => {
    setSaving(true);
    try {
      const settings = {
        tempWarningThreshold: String(warningThreshold),
        tempDangerThreshold: String(dangerThreshold),
        emailNotifications: String(notifications.email),
        telegramNotifications: String(notifications.telegram),
        whatsappNotifications: String(notifications.whatsapp),
        pushNotifications: String(notifications.push),
      };

      const res = await fetch("/api/settings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast({
        title: "✅ Settings Saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "❌ Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-validate thresholds
  useEffect(() => {
    if (warningThreshold >= dangerThreshold) {
      setDangerThreshold(warningThreshold + 10);
    }
  }, [warningThreshold, dangerThreshold]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Save Button - Sticky at top */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4">
        <Button 
          onClick={saveSettings} 
          disabled={saving} 
          className="w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-muted-foreground" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>Configure temperature thresholds for alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Warning Temperature</Label>
              <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">{warningThreshold}°C</span>
            </div>
            <Slider
              value={[warningThreshold]}
              onValueChange={([v]) => setWarningThreshold(v)}
              min={30}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-amber-500"
            />
            <p className="text-xs text-muted-foreground">Alerts triggered when temperature exceeds this value</p>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Danger Temperature</Label>
              <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400">{dangerThreshold}°C</span>
            </div>
            <Slider
              value={[dangerThreshold]}
              onValueChange={([v]) => setDangerThreshold(v)}
              min={50}
              max={150}
              step={5}
              className="[&_[role=slider]]:bg-red-500"
            />
            <p className="text-xs text-muted-foreground">Critical alerts triggered above this temperature</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            Notification Channels
          </CardTitle>
          <CardDescription>Configure how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingToggle
            icon={Mail}
            label="Email Notifications"
            description="Receive alerts via email"
            badge="Coming Soon"
            checked={notifications.email}
            onCheckedChange={(v) => setNotifications({ ...notifications, email: v })}
            disabled={true}
          />
          <SettingToggle
            icon={MessageCircle}
            label="Telegram Alerts"
            description="Get alerts via Telegram bot"
            badge="Coming Soon"
            checked={notifications.telegram}
            onCheckedChange={(v) => setNotifications({ ...notifications, telegram: v })}
            disabled={true}
          />
          <SettingToggle
            icon={Phone}
            label="WhatsApp Notifications"
            description="Receive alerts on WhatsApp"
            badge="Coming Soon"
            checked={notifications.whatsapp}
            onCheckedChange={(v) => setNotifications({ ...notifications, whatsapp: v })}
            disabled={true}
          />
          <SettingToggle
            icon={Bell}
            label="Push Notifications"
            description="Browser push notifications"
            checked={notifications.push}
            onCheckedChange={(v) => setNotifications({ ...notifications, push: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Webhook className="w-4 h-4 text-muted-foreground" />
            Integrations
          </CardTitle>
          <CardDescription>External service connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium">MQTT Protocol</span>
              <p className="text-xs text-muted-foreground">Real-time device communication</p>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-800">
              Coming Soon
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium">WebSocket Support</span>
              <p className="text-xs text-muted-foreground">Live data streaming</p>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-800">
              Coming Soon
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium">AI Prediction</span>
              <p className="text-xs text-muted-foreground">Machine learning fire prediction</p>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-800">
              Coming Soon
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            About FireGuard IoT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.1</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform</span>
            <span className="font-medium">ESP32 + Next.js</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Protocol</span>
            <span className="font-medium">REST API / MQTT Ready</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">License</span>
            <span className="font-medium">MIT</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
