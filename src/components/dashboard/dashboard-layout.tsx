"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Flame, LayoutDashboard, Cpu, Bell, Settings,
  Menu, Sun, Moon, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { DevicesView } from "@/components/devices/devices-view";
import { DeviceDetailView } from "@/components/devices/device-detail-view";
import { AlertsView } from "@/components/alerts/alerts-view";
import { SettingsView } from "@/components/settings/settings-view";
import { AIChatbot } from "@/components/chat/ai-chatbot";

export function DashboardLayout() {
  const { currentView } = useAppStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default: collapsed (icon-only)

  const views: Record<string, React.ReactNode> = {
    dashboard: <DashboardView />,
    devices: <DevicesView />,
    "device-detail": <DeviceDetailView />,
    alerts: <AlertsView />,
    settings: <SettingsView />,
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        sidebarCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        <TopNavbar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {views[currentView] || <DashboardView />}
        </main>
        <footer className="border-t py-3 px-6 text-center text-xs text-muted-foreground bg-card">
          FireGuard IoT v1.0 — Smart Fire Monitoring Platform
        </footer>
      </div>
      
      {/* AI Chatbot - Floating */}
      <AIChatbot />
    </div>
  );
}

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
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
    <aside className={cn(
      "hidden md:flex bg-card border-r flex-col fixed top-0 left-0 h-screen z-20 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "p-3 border-b flex items-center justify-center transition-all duration-300",
        collapsed ? "px-2" : "px-4"
      )}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 w-full">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm whitespace-nowrap truncate">FireGuard IoT</h1>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap truncate">Fire Monitoring</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
              {collapsed && item.badge ? (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {item.badge}
                </span>
              ) : null}
              
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  {item.badge ? ` (${item.badge})` : ""}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle Button - Always Visible at Bottom */}
      <div className="p-3 border-t flex items-center justify-center bg-card">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 hover:bg-accent border-2"
          onClick={() => onToggle(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>
    </aside>
  );
}

function TopNavbar() {
  const { currentView } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
