import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  colors: typeof MODE_CONFIG.reef.colors;
  isLoaded: boolean;
}

const AquaModeContext = createContext<AquaModeContextValue | null>(null);

const STORAGE_KEY = "aquaxone_mode";

// Mode configuration with colors for React Native
export const MODE_CONFIG = {
  reef: {
    label: "Reef Mode",
    shortLabel: "Reef",
    icon: "🪸",
    description: "Saltwater & reef tanks",
    colors: {
      primary: "#0891b2",
      secondary: "#f97316",
      tertiary: "#06b6d4",
      surface: "#e0f2fe",
      surfaceLight: "#f0f9ff",
      deep: "#0c4a6e",
      accent: "#0d9488",
      text: "#0f172a",
      textMuted: "#64748b",
      background: "#f8fafc",
      backgroundSecondary: "#f1f5f9",
      card: "#ffffff",
      border: "#e2e8f0",
    },
  },
  freshwater: {
    label: "Freshwater Mode",
    shortLabel: "Freshwater",
    icon: "🌿",
    description: "Freshwater & planted tanks",
    colors: {
      primary: "#059669",
      secondary: "#22c55e",
      tertiary: "#14b8a6",
      surface: "#ecfdf5",
      surfaceLight: "#f0fdf4",
      deep: "#064e3b",
      accent: "#15803d",
      text: "#0f172a",
      textMuted: "#64748b",
      background: "#f8fafc",
      backgroundSecondary: "#f1f5f9",
      card: "#ffffff",
      border: "#e2e8f0",
    },
  },
} as const;

// Parameter colors (shared across modes)
export const PARAMETER_COLORS = {
  // Reef parameters
  temp: "#f97316",
  salinity: "#3b82f6",
  alk: "#8b5cf6",
  ph: "#10b981",
  cal: "#06b6d4",
  mag: "#ec4899",
  po4: "#f59e0b",
  no3: "#ef4444",
  // Freshwater parameters
  gh: "#6366f1",
  kh: "#8b5cf6",
  ammonia: "#dc2626",
  nitrite: "#ea580c",
  co2: "#22c55e",
  iron: "#b45309",
};

export function AquaModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AquaMode>("reef");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved mode on mount
  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedMode === "reef" || savedMode === "freshwater") {
          setModeState(savedMode);
        }
      } catch (error) {
        console.warn("Failed to load aqua mode:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadMode();
  }, []);

  const setMode = useCallback(async (newMode: AquaMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
    } catch (error) {
      console.warn("Failed to save aqua mode:", error);
    }
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
    colors: MODE_CONFIG[mode].colors,
    isLoaded,
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

// Hook to get parameter color
export function useParameterColor(param: keyof typeof PARAMETER_COLORS): string {
  return PARAMETER_COLORS[param] || "#64748b";
}
