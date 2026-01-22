import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/constants';
import { colors, modeThemes, AquaMode } from '@/constants/theme';

interface AquaModeContextValue {
  mode: AquaMode;
  setMode: (mode: AquaMode) => void;
  toggleMode: () => void;
  isReefMode: boolean;
  isFreshwaterMode: boolean;
  modeLabel: string;
  modeIcon: string;
  theme: typeof modeThemes.reef;
}

const AquaModeContext = createContext<AquaModeContextValue | null>(null);

export function AquaModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AquaMode>('reef');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved mode on mount
  useEffect(() => {
    const loadMode = async () => {
      const savedMode = await storage.get<AquaMode>(STORAGE_KEYS.AQUA_MODE);
      if (savedMode === 'reef' || savedMode === 'freshwater') {
        setModeState(savedMode);
      }
      setIsHydrated(true);
    };
    loadMode();
  }, []);

  const setMode = useCallback(async (newMode: AquaMode) => {
    setModeState(newMode);
    await storage.set(STORAGE_KEYS.AQUA_MODE, newMode);
  }, []);

  const toggleMode = useCallback(() => {
    const newMode = mode === 'reef' ? 'freshwater' : 'reef';
    setMode(newMode);
  }, [mode, setMode]);

  // Ensure we always have a valid theme - default to reef if mode is invalid
  const theme = modeThemes[mode] || modeThemes.reef;

  const value: AquaModeContextValue = {
    mode,
    setMode,
    toggleMode,
    isReefMode: mode === 'reef',
    isFreshwaterMode: mode === 'freshwater',
    modeLabel: theme?.label || 'Reef Mode',
    modeIcon: theme?.icon || '🪸',
    theme,
  };

  // Prevent flash of wrong theme
  if (!isHydrated) {
    return null;
  }

  return (
    <AquaModeContext.Provider value={value}>
      {children}
    </AquaModeContext.Provider>
  );
}

export function useAquaMode() {
  const context = useContext(AquaModeContext);
  if (!context) {
    throw new Error('useAquaMode must be used within an AquaModeProvider');
  }
  return context;
}

// Export parameters based on mode
export { REEF_PARAMETERS, FRESHWATER_PARAMETERS } from '@/constants/app';
