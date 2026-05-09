"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Flame, LayoutDashboard, Cpu, Bell, Settings,
  Menu, Sun, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { DevicesView } from "@/components/devices/devices-view";
import { DeviceDetailView } from "@/components/devices/device-detail-view";
import { AlertsView } from "@/components/alerts/alerts-view";
import { SettingsView } from "@/components/settings/settings-view";

export function DashboardLayout() {
  const { currentView } = useAppStore();

  const views: Record<string, React.ReactNode> = {
    dashboard: <DashboardView />,
    devices: <DevicesView />,
    "device-detail": <DeviceDetailView />,
    alerts: <AlertsView />,
    settings: <SettingsView />,
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <TopNavbar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {views[currentView] || <DashboardView />}
          </div>
        </main>
        <footer className="border-t py-3 px-6 text-center text-xs text-muted-foreground bg-card">
          FireGuard IoT v1.0 — Smart Fire Monitoring Platform
        </footer>
      </div>
    </div>
  );
}

function AppSidebar() {
  const { currentView, setCurrentView } = useAppStore();
  const [unresolvedCount, setUnresolvedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/dashboard/stats`);
        const data = await res.json();
        if (!cancelled && data.success) setUnresolvedCount(data.data.unresolvedAlerts);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "devices", label: "Devices", icon: Cpu },
    { id: "alerts", label: "Alerts", icon: Bell, badge: unresolvedCount },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-card border-r flex-col fixed top-0 left-0 h-screen z-20">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm">FireGuard IoT</h1>
            <p className="text-[10px] text-muted-foreground">Fire Monitoring</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as "dashboard" | "devices" | "alerts" | "settings")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative",
                isActive
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {item.badge ? (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function TopNavbar() {
  const { currentView } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering theme icon after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const pageTitles: Record<string, string> = {
    dashboard: "Dashboard",
    devices: "Devices",
    "device-detail": "Device Details",
    alerts: "Alerts",
    settings: "Settings",
  };

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-accent"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-lg">{pageTitles[currentView] || "Dashboard"}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-9 w-9">
          {mounted ? (
            theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
          ) : (
            <div className="w-4 h-4" />
          )}
        </Button>
        {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
      </div>
    </header>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const { currentView, setCurrentView } = useAppStore();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "devices", label: "Devices", icon: Cpu },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="absolute top-14 left-0 right-0 bg-card border-b shadow-lg md:hidden z-50">
      <nav className="p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setCurrentView(item.id as any); onClose(); }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              currentView === item.id
                ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 font-medium"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
