import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Log what Metro inlined (will show 'undefined' if not found during build)
console.log('[Supabase Init] URL type:', typeof supabaseUrl, 'Key type:', typeof supabaseAnonKey);
console.log('[Supabase Init] URL defined:', !!supabaseUrl, 'Key defined:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `❌ CRITICAL: Supabase env vars not loaded!
  URL: ${supabaseUrl === undefined ? 'undefined' : 'empty'}
  Key: ${supabaseAnonKey === undefined ? 'undefined' : 'empty'}
  
  This means Metro didn't inline EXPO_PUBLIC_* vars during build.
  Check: mobile/.env file exists and eas build included it.`;
  
  console.error(errorMsg);
  throw new Error('Supabase configuration missing - check build environment');
}

// Custom storage adapter for React Native using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('SecureStore getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('SecureStore setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('SecureStore removeItem error:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
