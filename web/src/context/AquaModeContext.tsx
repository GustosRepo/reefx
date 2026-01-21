"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { setTankModeChangeCallback } from "./TankContext";

/**
 * AquaXOne Mode Types
 * - reef: Saltwater/reef tanks (original ReefXOne experience)
 * - freshwater: Freshwater and planted tanks
 */
export type AquaMode = "reef" | "freshwater";

interface AquaModeContextValue {
  mode: AquaMode;
  setMode: (mode: AquaMode) => void;
  toggleMode: () => void;
  isReefMode: boolean;
  isFreshwaterMode: boolean;
  modeLabel: string;
  modeIcon: string;
}

const AquaModeContext = createContext<AquaModeContextValue | null>(null);

const STORAGE_KEY = "aquaxone_mode";

// Mode configuration
export const MODE_CONFIG = {
  reef: {
    label: "Reef Mode",
    shortLabel: "Reef",
    icon: "🪸",
    description: "Saltwater & reef tanks",
    accentPrimary: "#0891b2", // cyan-600
    accentSecondary: "#f97316", // coral orange
    accentTertiary: "#06b6d4", // cyan-500
  },
  freshwater: {
    label: "Freshwater Mode",
    shortLabel: "Freshwater",
    icon: "🌿",
    description: "Freshwater & planted tanks",
    accentPrimary: "#059669", // emerald-600
    accentSecondary: "#22c55e", // green-500
    accentTertiary: "#14b8a6", // teal-500
  },
} as const;

export function AquaModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AquaMode>("reef");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY);
    if (savedMode === "reef" || savedMode === "freshwater") {
      setModeState(savedMode);
    }
    setIsHydrated(true);
  }, []);

  // Apply mode to document for CSS theming
  useEffect(() => {
    if (!isHydrated) return;

    // Update CSS custom properties based on mode
    const root = document.documentElement;
    const config = MODE_CONFIG[mode];

    root.setAttribute("data-aqua-mode", mode);
    root.style.setProperty("--aqua-accent-primary", config.accentPrimary);
    root.style.setProperty("--aqua-accent-secondary", config.accentSecondary);
    root.style.setProperty("--aqua-accent-tertiary", config.accentTertiary);
  }, [mode, isHydrated]);

  const setMode = useCallback((newMode: AquaMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  // Register callback so TankContext can sync mode when tank changes
  useEffect(() => {
    setTankModeChangeCallback(setMode);
    return () => setTankModeChangeCallback(() => {});
  }, [setMode]);

  const toggleMode = useCallback(() => {
    const newMode = mode === "reef" ? "freshwater" : "reef";
    setMode(newMode);
  }, [mode, setMode]);

  const value: AquaModeContextValue = {
    mode,
    setMode,
    toggleMode,
    isReefMode: mode === "reef",
    isFreshwaterMode: mode === "freshwater",
    modeLabel: MODE_CONFIG[mode].label,
    modeIcon: MODE_CONFIG[mode].icon,
  };

  return (
    <AquaModeContext.Provider value={value}>
      {children}
    </AquaModeContext.Provider>
  );
}

export function useAquaMode() {
  const context = useContext(AquaModeContext);
  if (!context) {
    throw new Error("useAquaMode must be used within an AquaModeProvider");
  }
  return context;
}

// Hook for conditional mode-based values
export function useModeValue<T>(reefValue: T, freshwaterValue: T): T {
  const { isReefMode } = useAquaMode();
  return isReefMode ? reefValue : freshwaterValue;
}

// Parameter configurations for each mode
export const REEF_PARAMETERS = [
  { key: "temp", label: "Temperature", placeholder: "e.g., 78", icon: "🌡️" },
  { key: "salinity", label: "Salinity (ppt)", placeholder: "e.g., 35", icon: "🧂" },
  { key: "alk", label: "Alkalinity (dKH)", placeholder: "e.g., 8.5", icon: "⚗️" },
  { key: "ph", label: "pH", placeholder: "e.g., 8.2", icon: "🔬" },
  { key: "cal", label: "Calcium (ppm)", placeholder: "e.g., 420", icon: "💎" },
  { key: "mag", label: "Magnesium (ppm)", placeholder: "e.g., 1350", icon: "✨" },
  { key: "po4", label: "Phosphate (PO₄)", placeholder: "e.g., 0.05", icon: "🧪" },
  { key: "no3", label: "Nitrate (NO₃)", placeholder: "e.g., 5", icon: "📊" },
] as const;

export const FRESHWATER_PARAMETERS = [
  { key: "temp", label: "Temperature", placeholder: "e.g., 76", icon: "🌡️" },
  { key: "ph", label: "pH", placeholder: "e.g., 7.0", icon: "🔬" },
  { key: "gh", label: "GH (General Hardness)", placeholder: "e.g., 8", icon: "💧" },
  { key: "kh", label: "KH (Carbonate Hardness)", placeholder: "e.g., 4", icon: "⚗️" },
  { key: "ammonia", label: "Ammonia (NH₃)", placeholder: "e.g., 0", icon: "⚠️" },
  { key: "no2", label: "Nitrite (NO₂)", placeholder: "e.g., 0", icon: "🧪" },
  { key: "no3", label: "Nitrate (NO₃)", placeholder: "e.g., 20", icon: "📊" },
  { key: "po4", label: "Phosphate (PO₄)", placeholder: "e.g., 0.5", icon: "🌿" },
] as const;

// Hook to get mode-appropriate parameters
export function useModeParameters() {
  const { isReefMode } = useAquaMode();
  return isReefMode ? REEF_PARAMETERS : FRESHWATER_PARAMETERS;
}
