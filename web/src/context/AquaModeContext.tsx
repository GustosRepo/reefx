"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

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
