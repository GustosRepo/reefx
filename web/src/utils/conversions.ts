// Unit conversion utilities for ReefXOne

export type TempUnit = 'fahrenheit' | 'celsius';
export type VolumeUnit = 'gallons' | 'liters';

// ============================================================================
// TEMPERATURE CONVERSIONS
// ============================================================================

export const fahrenheitToCelsius = (temp: number): number => {
  return (temp - 32) * (5 / 9);
};

export const celsiusToFahrenheit = (temp: number): number => {
  return (temp * 9 / 5) + 32;
};

export const convertTemperature = (
  temp: number,
  fromUnit: TempUnit,
  toUnit: TempUnit
): number => {
  if (fromUnit === toUnit) return temp;
  
  if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
    return fahrenheitToCelsius(temp);
  }
  
  return celsiusToFahrenheit(temp);
};

export const formatTemperature = (
  temp: number,
  unit: TempUnit,
  decimals: number = 1
): string => {
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';
  return `${temp.toFixed(decimals)}${symbol}`;
};

// ============================================================================
// VOLUME CONVERSIONS
// ============================================================================

export const gallonsToLiters = (gallons: number): number => {
  return gallons * 3.78541;
};

export const litersToGallons = (liters: number): number => {
  return liters / 3.78541;
};

export const convertVolume = (
  volume: number,
  fromUnit: VolumeUnit,
  toUnit: VolumeUnit
): number => {
  if (fromUnit === toUnit) return volume;
  
  if (fromUnit === 'gallons' && toUnit === 'liters') {
    return gallonsToLiters(volume);
  }
  
  return litersToGallons(volume);
};

export const formatVolume = (
  volume: number,
  unit: VolumeUnit,
  decimals: number = 0
): string => {
  const symbol = unit === 'gallons' ? ' gal' : ' L';
  return `${volume.toFixed(decimals)}${symbol}`;
};

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Convert and format temperature for display based on user preference
 * Always store in Fahrenheit in database, convert for display
 */
export const displayTemperature = (
  tempInFahrenheit: number,
  userPreference: TempUnit
): string => {
  if (userPreference === 'celsius') {
    const celsius = fahrenheitToCelsius(tempInFahrenheit);
    return formatTemperature(celsius, 'celsius');
  }
  return formatTemperature(tempInFahrenheit, 'fahrenheit');
};

/**
 * Convert and format volume for display based on user preference
 * Always store in Gallons in database, convert for display
 */
export const displayVolume = (
  volumeInGallons: number,
  userPreference: VolumeUnit
): string => {
  if (userPreference === 'liters') {
    const liters = gallonsToLiters(volumeInGallons);
    return formatVolume(liters, 'liters');
  }
  return formatVolume(volumeInGallons, 'gallons');
};

/**
 * Convert user input to database storage format (Fahrenheit)
 */
export const normalizeTemperature = (
  temp: number,
  userUnit: TempUnit
): number => {
  if (userUnit === 'celsius') {
    return celsiusToFahrenheit(temp);
  }
  return temp;
};

/**
 * Convert user input to database storage format (Gallons)
 */
export const normalizeVolume = (
  volume: number,
  userUnit: VolumeUnit
): number => {
  if (userUnit === 'liters') {
    return litersToGallons(volume);
  }
  return volume;
};
