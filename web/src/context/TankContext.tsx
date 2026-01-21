
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface Tank {
  id: string;
  name: string;
  type: string;
  volume: number;
  aqua_mode?: "reef" | "freshwater";
}

interface TankContextValue {
  tanks: Tank[];
  currentTank: Tank | null;
  setCurrentTank: (tank: Tank) => void;
  loading: boolean;
  refreshTanks: () => Promise<void>;
}

const TankContext = createContext<TankContextValue | null>(null);

// We'll use a callback to sync with AquaMode - this avoids circular imports
let onTankModeChange: ((mode: "reef" | "freshwater") => void) | null = null;

export function setTankModeChangeCallback(callback: (mode: "reef" | "freshwater") => void) {
  onTankModeChange = callback;
}

export function TankProvider({ children }: { children: ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [currentTank, setCurrentTankState] = useState<Tank | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTanks = async () => {
    try {
      const response = await fetch('/api/tanks');
      // Silently ignore 401 (not logged in) - this is expected on landing page
      if (response.status === 401 || !response.ok) {
        setLoading(false);
        return;
      }
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.warn('Expected JSON response from /api/tanks but got:', contentType);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setTanks(data);
        
        // Check if we have a saved tank preference
        const savedTankId = localStorage.getItem('aquaxone_current_tank');
        const savedTank = savedTankId ? data.find((t: Tank) => t.id === savedTankId) : null;
        
        const tankToSet = savedTank || data[0];
        setCurrentTankState(tankToSet);
        
        // Sync aqua mode with the tank's mode
        if (tankToSet.aqua_mode && onTankModeChange) {
          onTankModeChange(tankToSet.aqua_mode);
        }
      }
    } catch (err) {
      console.error('Failed to load tanks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTanks();
  }, []);

  const setCurrentTank = useCallback((tank: Tank) => {
    setCurrentTankState(tank);
    localStorage.setItem('aquaxone_current_tank', tank.id);
    
    // Sync aqua mode when tank changes
    if (tank.aqua_mode && onTankModeChange) {
      onTankModeChange(tank.aqua_mode);
    }
  }, []);

  const refreshTanks = async () => {
    await loadTanks();
  };

  return (
    <TankContext.Provider value={{ tanks, currentTank, setCurrentTank, loading, refreshTanks }}>
      {children}
    </TankContext.Provider>
  );
}

export function useTank() {
  const context = useContext(TankContext);
  if (!context) {
    throw new Error('useTank must be used within a TankProvider');
  }
  return context;
}
