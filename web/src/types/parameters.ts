/**
 * AQUAXONE Parameter Definitions
 * Defines water parameters for both Reef and Freshwater modes
 */

export type AquaMode = "reef" | "freshwater";

export interface ParameterDefinition {
  key: string;
  label: string;
  shortLabel: string;
  unit: string;
  color: string;
  icon: string;
  description: string;
  defaultMin: number;
  defaultMax: number;
  decimalPlaces: number;
  step: number;
  modes: AquaMode[];
}

// ═══════════════════════════════════════════════════════════════════════════
// REEF MODE PARAMETERS
// Standard saltwater reef aquarium parameters
// ═══════════════════════════════════════════════════════════════════════════
export const REEF_PARAMETERS: ParameterDefinition[] = [
  {
    key: "temp",
    label: "Temperature",
    shortLabel: "Temp",
    unit: "°F",
    color: "#f97316",
    icon: "🌡️",
    description: "Water temperature",
    defaultMin: 76,
    defaultMax: 82,
    decimalPlaces: 1,
    step: 0.1,
    modes: ["reef", "freshwater"],
  },
  {
    key: "salinity",
    label: "Salinity",
    shortLabel: "Sal",
    unit: "ppt",
    color: "#3b82f6",
    icon: "🧂",
    description: "Salt concentration",
    defaultMin: 1.024,
    defaultMax: 1.026,
    decimalPlaces: 3,
    step: 0.001,
    modes: ["reef"],
  },
  {
    key: "alk",
    label: "Alkalinity",
    shortLabel: "ALK",
    unit: "dKH",
    color: "#8b5cf6",
    icon: "⚗️",
    description: "Carbonate hardness / buffering capacity",
    defaultMin: 7.5,
    defaultMax: 11,
    decimalPlaces: 1,
    step: 0.1,
    modes: ["reef"],
  },
  {
    key: "ph",
    label: "pH",
    shortLabel: "pH",
    unit: "",
    color: "#10b981",
    icon: "📊",
    description: "Acidity/alkalinity level",
    defaultMin: 7.8,
    defaultMax: 8.4,
    decimalPlaces: 2,
    step: 0.01,
    modes: ["reef", "freshwater"],
  },
  {
    key: "cal",
    label: "Calcium",
    shortLabel: "Ca",
    unit: "ppm",
    color: "#06b6d4",
    icon: "💎",
    description: "Essential for coral growth",
    defaultMin: 380,
    defaultMax: 450,
    decimalPlaces: 0,
    step: 1,
    modes: ["reef"],
  },
  {
    key: "mag",
    label: "Magnesium",
    shortLabel: "Mg",
    unit: "ppm",
    color: "#ec4899",
    icon: "🔮",
    description: "Stabilizes calcium and alkalinity",
    defaultMin: 1250,
    defaultMax: 1450,
    decimalPlaces: 0,
    step: 1,
    modes: ["reef"],
  },
  {
    key: "po4",
    label: "Phosphate",
    shortLabel: "PO₄",
    unit: "ppm",
    color: "#f59e0b",
    icon: "🍃",
    description: "Nutrient level - keep low",
    defaultMin: 0,
    defaultMax: 0.1,
    decimalPlaces: 3,
    step: 0.001,
    modes: ["reef", "freshwater"],
  },
  {
    key: "no3",
    label: "Nitrate",
    shortLabel: "NO₃",
    unit: "ppm",
    color: "#ef4444",
    icon: "⚠️",
    description: "Final stage of nitrogen cycle",
    defaultMin: 0,
    defaultMax: 20,
    decimalPlaces: 1,
    step: 0.1,
    modes: ["reef", "freshwater"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// FRESHWATER MODE PARAMETERS
// Freshwater and planted tank specific parameters
// ═══════════════════════════════════════════════════════════════════════════
export const FRESHWATER_PARAMETERS: ParameterDefinition[] = [
  {
    key: "temp",
    label: "Temperature",
    shortLabel: "Temp",
    unit: "°F",
    color: "#f97316",
    icon: "🌡️",
    description: "Water temperature",
    defaultMin: 72,
    defaultMax: 82,
    decimalPlaces: 1,
    step: 0.1,
    modes: ["reef", "freshwater"],
  },
  {
    key: "ph",
    label: "pH",
    shortLabel: "pH",
    unit: "",
    color: "#10b981",
    icon: "📊",
    description: "Acidity/alkalinity level",
    defaultMin: 6.5,
    defaultMax: 7.5,
    decimalPlaces: 2,
    step: 0.01,
    modes: ["reef", "freshwater"],
  },
  {
    key: "gh",
    label: "General Hardness",
    shortLabel: "GH",
    unit: "dGH",
    color: "#6366f1",
    icon: "💧",
    description: "Dissolved minerals (calcium & magnesium)",
    defaultMin: 4,
    defaultMax: 12,
    decimalPlaces: 0,
    step: 1,
    modes: ["freshwater"],
  },
  {
    key: "kh",
    label: "Carbonate Hardness",
    shortLabel: "KH",
    unit: "dKH",
    color: "#8b5cf6",
    icon: "⚗️",
    description: "Buffering capacity",
    defaultMin: 3,
    defaultMax: 8,
    decimalPlaces: 0,
    step: 1,
    modes: ["freshwater"],
  },
  {
    key: "ammonia",
    label: "Ammonia",
    shortLabel: "NH₃",
    unit: "ppm",
    color: "#dc2626",
    icon: "☠️",
    description: "Toxic - should be 0",
    defaultMin: 0,
    defaultMax: 0,
    decimalPlaces: 2,
    step: 0.01,
    modes: ["freshwater"],
  },
  {
    key: "nitrite",
    label: "Nitrite",
    shortLabel: "NO₂",
    unit: "ppm",
    color: "#ea580c",
    icon: "⚠️",
    description: "Toxic - should be 0",
    defaultMin: 0,
    defaultMax: 0,
    decimalPlaces: 2,
    step: 0.01,
    modes: ["freshwater"],
  },
  {
    key: "no3",
    label: "Nitrate",
    shortLabel: "NO₃",
    unit: "ppm",
    color: "#ef4444",
    icon: "📈",
    description: "End product of nitrogen cycle",
    defaultMin: 0,
    defaultMax: 40,
    decimalPlaces: 1,
    step: 0.1,
    modes: ["reef", "freshwater"],
  },
  {
    key: "po4",
    label: "Phosphate",
    shortLabel: "PO₄",
    unit: "ppm",
    color: "#f59e0b",
    icon: "🍃",
    description: "Nutrient - affects plant/algae growth",
    defaultMin: 0,
    defaultMax: 1,
    decimalPlaces: 2,
    step: 0.01,
    modes: ["reef", "freshwater"],
  },
  {
    key: "co2",
    label: "CO₂",
    shortLabel: "CO₂",
    unit: "ppm",
    color: "#22c55e",
    icon: "🫧",
    description: "Carbon dioxide for planted tanks",
    defaultMin: 20,
    defaultMax: 35,
    decimalPlaces: 0,
    step: 1,
    modes: ["freshwater"],
  },
  {
    key: "iron",
    label: "Iron",
    shortLabel: "Fe",
    unit: "ppm",
    color: "#b45309",
    icon: "🔩",
    description: "Essential for plant health",
    defaultMin: 0.1,
    defaultMax: 0.5,
    decimalPlaces: 2,
    step: 0.01,
    modes: ["freshwater"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get parameters for a specific mode
 */
export function getParametersForMode(mode: AquaMode): ParameterDefinition[] {
  if (mode === "reef") {
    return REEF_PARAMETERS;
  }
  return FRESHWATER_PARAMETERS;
}

/**
 * Get a specific parameter definition
 */
export function getParameter(key: string, mode: AquaMode): ParameterDefinition | undefined {
  const params = getParametersForMode(mode);
  return params.find((p) => p.key === key);
}

/**
 * Get parameter color by key
 */
export function getParameterColor(key: string): string {
  const allParams = [...REEF_PARAMETERS, ...FRESHWATER_PARAMETERS];
  const param = allParams.find((p) => p.key === key);
  return param?.color || "#64748b";
}

/**
 * Check if a parameter is available in a mode
 */
export function isParameterInMode(key: string, mode: AquaMode): boolean {
  const params = getParametersForMode(mode);
  return params.some((p) => p.key === key);
}

/**
 * Get the label mapping for charts and displays
 */
export function getParameterLabelMap(mode: AquaMode): Record<string, string> {
  const params = getParametersForMode(mode);
  return params.reduce((acc, param) => {
    acc[param.key] = `${param.label}${param.unit ? ` (${param.unit})` : ""}`;
    return acc;
  }, {} as Record<string, string>);
}

// ═══════════════════════════════════════════════════════════════════════════
// LIVESTOCK TYPES (Mode-specific)
// ═══════════════════════════════════════════════════════════════════════════

export interface LivestockCategory {
  key: string;
  label: string;
  icon: string;
  modes: AquaMode[];
}

export const LIVESTOCK_CATEGORIES: LivestockCategory[] = [
  // Shared
  { key: "fish", label: "Fish", icon: "🐠", modes: ["reef", "freshwater"] },
  { key: "invertebrate", label: "Invertebrates", icon: "🦐", modes: ["reef", "freshwater"] },
  { key: "snail", label: "Snails", icon: "🐌", modes: ["reef", "freshwater"] },
  
  // Reef-specific
  { key: "coral_sps", label: "SPS Corals", icon: "🪸", modes: ["reef"] },
  { key: "coral_lps", label: "LPS Corals", icon: "🌺", modes: ["reef"] },
  { key: "coral_soft", label: "Soft Corals", icon: "🌸", modes: ["reef"] },
  { key: "anemone", label: "Anemones", icon: "🌼", modes: ["reef"] },
  { key: "clam", label: "Clams", icon: "🐚", modes: ["reef"] },
  
  // Freshwater-specific
  { key: "plant", label: "Plants", icon: "🌿", modes: ["freshwater"] },
  { key: "shrimp", label: "Shrimp", icon: "🦐", modes: ["freshwater"] },
  { key: "crayfish", label: "Crayfish", icon: "🦞", modes: ["freshwater"] },
];

export function getLivestockCategoriesForMode(mode: AquaMode): LivestockCategory[] {
  return LIVESTOCK_CATEGORIES.filter((cat) => cat.modes.includes(mode));
}

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE TYPES (Mode-specific)
// ═══════════════════════════════════════════════════════════════════════════

export interface MaintenanceType {
  key: string;
  label: string;
  icon: string;
  defaultIntervalDays: number;
  modes: AquaMode[];
}

export const MAINTENANCE_TYPES: MaintenanceType[] = [
  // Shared
  { key: "water_change", label: "Water Change", icon: "💧", defaultIntervalDays: 7, modes: ["reef", "freshwater"] },
  { key: "filter_clean", label: "Filter Cleaning", icon: "🧹", defaultIntervalDays: 14, modes: ["reef", "freshwater"] },
  { key: "glass_clean", label: "Glass Cleaning", icon: "✨", defaultIntervalDays: 3, modes: ["reef", "freshwater"] },
  { key: "test_water", label: "Water Testing", icon: "🧪", defaultIntervalDays: 7, modes: ["reef", "freshwater"] },
  
  // Reef-specific
  { key: "dose_alk", label: "Dose Alkalinity", icon: "⚗️", defaultIntervalDays: 1, modes: ["reef"] },
  { key: "dose_cal", label: "Dose Calcium", icon: "💎", defaultIntervalDays: 1, modes: ["reef"] },
  { key: "dose_mag", label: "Dose Magnesium", icon: "🔮", defaultIntervalDays: 7, modes: ["reef"] },
  { key: "coral_dip", label: "Coral Dipping", icon: "🪸", defaultIntervalDays: 30, modes: ["reef"] },
  { key: "skimmer_clean", label: "Skimmer Cleaning", icon: "🫧", defaultIntervalDays: 7, modes: ["reef"] },
  { key: "ato_refill", label: "ATO Refill", icon: "🚰", defaultIntervalDays: 7, modes: ["reef"] },
  
  // Freshwater-specific
  { key: "dose_fertilizer", label: "Dose Fertilizer", icon: "🌱", defaultIntervalDays: 7, modes: ["freshwater"] },
  { key: "dose_co2", label: "CO₂ Refill", icon: "🫧", defaultIntervalDays: 30, modes: ["freshwater"] },
  { key: "trim_plants", label: "Trim Plants", icon: "✂️", defaultIntervalDays: 14, modes: ["freshwater"] },
  { key: "gravel_vac", label: "Gravel Vacuum", icon: "🧹", defaultIntervalDays: 14, modes: ["freshwater"] },
  { key: "dose_iron", label: "Dose Iron", icon: "🔩", defaultIntervalDays: 7, modes: ["freshwater"] },
];

export function getMaintenanceTypesForMode(mode: AquaMode): MaintenanceType[] {
  return MAINTENANCE_TYPES.filter((type) => type.modes.includes(mode));
}
