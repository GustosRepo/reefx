/**
 * AquaXone Design Tokens
 * Centralized theme configuration matching the web app
 */

export const colors = {
  // Brand colors
  brand: {
    primary: '#0891b2',
    light: '#22d3ee',
    dark: '#0e7490',
  },

  // Background colors
  background: {
    primary: '#d4eef4',
    secondary: '#c5e6ee',
    surface: '#ffffff',
  },

  // Text colors
  text: {
    primary: '#1a3340',
    secondary: '#4a6b7a',
    muted: '#64748b',
    inverse: '#ffffff',
  },

  // Border colors
  border: {
    light: '#a8d4e0',
    medium: '#8bc4d4',
  },

  // Reef mode palette
  reef: {
    cyan: '#0891b2',
    teal: '#0d9488',
    ocean: '#0369a1',
    coral: '#f97316',
    anemone: '#ec4899',
    purple: '#8b5cf6',
    surface: '#e0f2fe',
    deep: '#0c4a6e',
  },

  // Freshwater mode palette
  fresh: {
    emerald: '#059669',
    green: '#22c55e',
    teal: '#14b8a6',
    aqua: '#06b6d4',
    lime: '#84cc16',
    nature: '#15803d',
    surface: '#ecfdf5',
    deep: '#064e3b',
  },

  // Parameter-specific colors
  params: {
    temp: '#f97316',
    salinity: '#3b82f6',
    alk: '#8b5cf6',
    ph: '#10b981',
    cal: '#06b6d4',
    mag: '#ec4899',
    po4: '#f59e0b',
    no3: '#ef4444',
    gh: '#6366f1',
    kh: '#8b5cf6',
    ammonia: '#dc2626',
    nitrite: '#ea580c',
    co2: '#22c55e',
    iron: '#b45309',
  },

  // Status colors
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Mode-specific theme configurations
export const modeThemes = {
  reef: {
    accentPrimary: colors.reef.cyan,
    accentSecondary: colors.reef.coral,
    accentTertiary: colors.reef.teal,
    surface: colors.reef.surface,
    deep: colors.reef.deep,
    icon: '🪸',
    label: 'Reef Mode',
  },
  freshwater: {
    accentPrimary: colors.fresh.emerald,
    accentSecondary: colors.fresh.green,
    accentTertiary: colors.fresh.teal,
    surface: colors.fresh.surface,
    deep: colors.fresh.deep,
    icon: '🌿',
    label: 'Freshwater Mode',
  },
};

export type AquaMode = 'reef' | 'freshwater';

export const getThemeForMode = (mode: AquaMode) => modeThemes[mode];
