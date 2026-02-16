import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { useAuth } from './AuthContext';
import { useAquaMode } from './AquaModeContext';
import { Tank } from '@shared/types';
import { STORAGE_KEYS } from '@/constants';
import { DEMO_TANKS, DEMO_TANK } from '@/constants/demoData';

interface TankContextValue {
  tanks: Tank[];
  currentTank: Tank | null;
  isLoading: boolean;
  setCurrentTank: (tank: Tank) => void;
  refreshTanks: () => Promise<void>;
  createTank: (name: string, type: 'reef' | 'freshwater', size?: number) => Promise<Tank | null>;
  deleteTank: (tankId: string) => Promise<boolean>;
}

const TankContext = createContext<TankContextValue | null>(null);

export function TankProvider({ children }: { children: ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [currentTank, setCurrentTankState] = useState<Tank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isGuestMode } = useAuth();
  const { setMode } = useAquaMode();

  const refreshTanks = useCallback(async () => {
    // Guest mode: use demo data
    if (isGuestMode) {
      setTanks(DEMO_TANKS);
      setCurrentTankState(DEMO_TANK);
      setMode('reef');
      setIsLoading(false);
      return;
    }

    if (!user) {
      setTanks([]);
      setCurrentTankState(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tanks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const tankList = data || [];
      setTanks(tankList);

      // Restore last selected tank or pick first
      if (tankList.length > 0) {
        const savedTankId = await storage.get<string>(STORAGE_KEYS.CURRENT_TANK);
        const savedTank = tankList.find(t => t.id === savedTankId);
        const tankToSelect = savedTank || tankList[0];
        setCurrentTankState(tankToSelect);
        
        // Sync mode with tank type
        // freshwater types: freshwater, planted, community, etc.
        const freshwaterTypes = ['freshwater', 'planted', 'community', 'cichlid', 'tropical'];
        const isFreshwater = tankToSelect.type && freshwaterTypes.includes(tankToSelect.type.toLowerCase());
        const mode = isFreshwater ? 'freshwater' : 'reef';
        setMode(mode);
      } else {
        // No tanks yet - clear demo tank and storage
        setCurrentTankState(null);
        await storage.remove(STORAGE_KEYS.CURRENT_TANK);
      }
    } catch (error) {
      console.error('Error fetching tanks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isGuestMode, setMode]);

  useEffect(() => {
    refreshTanks();
  }, [refreshTanks]);

  const setCurrentTank = useCallback(async (tank: Tank) => {
    setCurrentTankState(tank);
    await storage.set(STORAGE_KEYS.CURRENT_TANK, tank.id);
    
    // Sync mode with tank type
    // freshwater types: freshwater, planted, community, etc.
    // reef types: reef, fowlr, nano, marine, saltwater, etc.
    const freshwaterTypes = ['freshwater', 'planted', 'community', 'cichlid', 'tropical'];
    const isFreshwater = tank.type && freshwaterTypes.includes(tank.type.toLowerCase());
    const mode = isFreshwater ? 'freshwater' : 'reef';
    setMode(mode);
  }, [setMode]);

  const createTank = useCallback(async (
    name: string, 
    type: 'reef' | 'freshwater', 
    size?: number
  ): Promise<Tank | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tanks')
        .insert({
          name,
          type,
          size_gallons: size,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await refreshTanks();
      return data;
    } catch (error) {
      console.error('Error creating tank:', error);
      return null;
    }
  }, [user, refreshTanks]);

  const deleteTank = useCallback(async (tankId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tanks')
        .delete()
        .eq('id', tankId);

      if (error) throw error;

      await refreshTanks();
      return true;
    } catch (error) {
      console.error('Error deleting tank:', error);
      return false;
    }
  }, [refreshTanks]);

  return (
    <TankContext.Provider
      value={{
        tanks,
        currentTank,
        isLoading,
        setCurrentTank,
        refreshTanks,
        createTank,
        deleteTank,
      }}
    >
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
