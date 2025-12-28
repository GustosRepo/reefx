
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Tank {
  id: string;
  name: string;
  type: string;
  volume: number;
}

interface TankContextValue {
  tanks: Tank[];
  currentTank: Tank | null;
  setCurrentTank: (tank: Tank) => void;
  loading: boolean;
  refreshTanks: () => Promise<void>;
}

const TankContext = createContext<TankContextValue | null>(null);

export function TankProvider({ children }: { children: ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [currentTank, setCurrentTankState] = useState<Tank | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTanks = async () => {
    try {
      const response = await fetch('/api/tanks');
      if (!response.ok) {
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
        const savedTankId = localStorage.getItem('reefxone_current_tank');
        const savedTank = savedTankId ? data.find((t: Tank) => t.id === savedTankId) : null;
        
        setCurrentTankState(savedTank || data[0]);
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

  const setCurrentTank = (tank: Tank) => {
    setCurrentTankState(tank);
    localStorage.setItem('reefxone_current_tank', tank.id);
  };

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
