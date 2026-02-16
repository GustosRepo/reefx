import { supabase } from './supabase';
import { storage } from './storage';

export interface Thresholds {
  temp_min: number; temp_max: number;
  salinity_min: number; salinity_max: number;
  alk_min: number; alk_max: number;
  ph_min: number; ph_max: number;
  cal_min: number; cal_max: number;
  mag_min: number; mag_max: number;
  po4_min: number; po4_max: number;
  no3_min: number; no3_max: number;
  // Freshwater
  gh_min?: number; gh_max?: number;
  kh_min?: number; kh_max?: number;
  ammonia_min?: number; ammonia_max?: number;
  no2_min?: number; no2_max?: number;
}

export interface ParameterWarning {
  key: string;
  label: string;
  value: number;
  type: 'low' | 'high';
  min: number;
  max: number;
}

// Default reef thresholds (matching web app)
export const REEF_DEFAULTS: Thresholds = {
  temp_min: 75, temp_max: 81,
  salinity_min: 33, salinity_max: 36,
  alk_min: 7, alk_max: 10,
  ph_min: 8.0, ph_max: 8.4,
  cal_min: 400, cal_max: 450,
  mag_min: 1250, mag_max: 1400,
  po4_min: 0, po4_max: 0.1,
  no3_min: 0, no3_max: 10,
};

// Default freshwater thresholds
export const FRESHWATER_DEFAULTS: Thresholds = {
  temp_min: 72, temp_max: 82,
  salinity_min: 0, salinity_max: 0,
  alk_min: 0, alk_max: 0,
  ph_min: 6.5, ph_max: 7.5,
  cal_min: 0, cal_max: 0,
  mag_min: 0, mag_max: 0,
  po4_min: 0, po4_max: 1,
  no3_min: 0, no3_max: 40,
  gh_min: 4, gh_max: 12,
  kh_min: 3, kh_max: 8,
  ammonia_min: 0, ammonia_max: 0,
  no2_min: 0, no2_max: 0,
};

const THRESHOLDS_CACHE_KEY = 'aquaxone_thresholds';

// Parameter label map
const PARAM_LABELS: Record<string, string> = {
  temp: 'Temperature',
  salinity: 'Salinity',
  ph: 'pH',
  alk: 'Alkalinity',
  cal: 'Calcium',
  mag: 'Magnesium',
  no3: 'Nitrate',
  po4: 'Phosphate',
  gh: 'GH',
  kh: 'KH',
  ammonia: 'Ammonia',
  no2: 'Nitrite',
};

/**
 * Fetch thresholds from Supabase for the current user (normalized table).
 * Falls back to defaults if none are saved.
 */
export async function fetchThresholds(userId: string): Promise<Thresholds> {
  try {
    const { data, error } = await supabase
      .from('thresholds')
      .select('parameter, min_value, max_value')
      .eq('user_id', userId)
      .is('tank_id', null); // Global user thresholds (not tank-specific)

    if (error || !data || data.length === 0) {
      // Return defaults and cache them
      const defaults = REEF_DEFAULTS;
      await storage.set(THRESHOLDS_CACHE_KEY, defaults);
      return defaults;
    }

    // Convert normalized rows back to flat object
    const thresholds: any = {};
    data.forEach(row => {
      const param = row.parameter;
      thresholds[`${param}_min`] = row.min_value;
      thresholds[`${param}_max`] = row.max_value;
    });

    await storage.set(THRESHOLDS_CACHE_KEY, thresholds);
    return thresholds as Thresholds;
  } catch {
    // Offline fallback: try cached
    const cached = await storage.get<Thresholds>(THRESHOLDS_CACHE_KEY);
    return cached || REEF_DEFAULTS;
  }
}

/**
 * Save thresholds to Supabase (normalized table structure).
 */
export async function saveThresholds(userId: string, thresholds: Thresholds): Promise<boolean> {
  try {
    // Convert flat thresholds object to normalized rows
    const rows: Array<{user_id: string, tank_id: null, parameter: string, min_value: number, max_value: number}> = [];
    
    const paramMap: Record<string, {min: keyof Thresholds, max: keyof Thresholds}> = {
      temp: { min: 'temp_min', max: 'temp_max' },
      salinity: { min: 'salinity_min', max: 'salinity_max' },
      alk: { min: 'alk_min', max: 'alk_max' },
      ph: { min: 'ph_min', max: 'ph_max' },
      cal: { min: 'cal_min', max: 'cal_max' },
      mag: { min: 'mag_min', max: 'mag_max' },
      po4: { min: 'po4_min', max: 'po4_max' },
      no3: { min: 'no3_min', max: 'no3_max' },
      gh: { min: 'gh_min', max: 'gh_max' },
      kh: { min: 'kh_min', max: 'kh_max' },
      ammonia: { min: 'ammonia_min', max: 'ammonia_max' },
      no2: { min: 'no2_min', max: 'no2_max' },
    };

    for (const [param, keys] of Object.entries(paramMap)) {
      const minVal = thresholds[keys.min];
      const maxVal = thresholds[keys.max];
      
      if (minVal !== undefined && maxVal !== undefined) {
        rows.push({
          user_id: userId,
          tank_id: null,
          parameter: param,
          min_value: minVal,
          max_value: maxVal,
        });
      }
    }

    // Upsert all threshold rows
    const { error } = await supabase
      .from('thresholds')
      .upsert(rows, {
        onConflict: 'user_id,tank_id,parameter',
      });

    if (error) {
      console.error('Error saving thresholds:', error);
      return false;
    }

    await storage.set(THRESHOLDS_CACHE_KEY, thresholds);
    return true;
  } catch (err) {
    console.error('Error saving thresholds:', err);
    return false;
  }
}

/**
 * Get cached thresholds (for offline / quick access).
 */
export async function getCachedThresholds(): Promise<Thresholds> {
  const cached = await storage.get<Thresholds>(THRESHOLDS_CACHE_KEY);
  return cached || REEF_DEFAULTS;
}

/**
 * Check parameter values against thresholds.
 * Returns an array of warnings for out-of-range values.
 */
export function checkThresholds(
  logEntry: Record<string, any>,
  thresholds: Thresholds,
  paramKeys: string[]
): ParameterWarning[] {
  const warnings: ParameterWarning[] = [];

  for (const key of paramKeys) {
    const value = logEntry[key];
    if (value === null || value === undefined || value === '') continue;

    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) continue;

    const minKey = `${key}_min` as keyof Thresholds;
    const maxKey = `${key}_max` as keyof Thresholds;
    const min = thresholds[minKey];
    const max = thresholds[maxKey];

    if (min === undefined || max === undefined) continue;
    // Skip if both are 0 (parameter not configured)
    if (min === 0 && max === 0) continue;

    if (numValue < (min as number)) {
      warnings.push({
        key,
        label: PARAM_LABELS[key] || key,
        value: numValue,
        type: 'low',
        min: min as number,
        max: max as number,
      });
    } else if (numValue > (max as number)) {
      warnings.push({
        key,
        label: PARAM_LABELS[key] || key,
        value: numValue,
        type: 'high',
        min: min as number,
        max: max as number,
      });
    }
  }

  return warnings;
}
