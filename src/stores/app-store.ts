import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ViewType } from "@/types";

interface AppState {
  // Navigation
  currentView: ViewType;
  selectedDeviceId: string | null;
  setCurrentView: (view: ViewType, deviceId?: string | null) => void;

  // Theme
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation state
      currentView: "dashboard",
      selectedDeviceId: null,
      setCurrentView: (view, deviceId = null) =>
        set({ currentView: view, selectedDeviceId: deviceId }),

      // Sidebar state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "fire-monitor-storage",
      partialize: (state) => ({
        currentView: state.currentView,
        selectedDeviceId: state.selectedDeviceId,
      }),
    }
  )
);
