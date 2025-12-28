// Utility functions for exporting data to CSV

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Convert an array of objects to CSV format
 */
export function objectsToCSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return '';

  // Use provided columns or derive from first object
  const cols = columns || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key }));
  
  // Create header row
  const headers = cols.map(col => `"${col.label}"`).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return cols.map(col => {
      const value = item[col.key];
      // Handle different types
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      return String(value);
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Download a CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export parameter logs to CSV
 */
export function exportLogs(logs: any[]): void {
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'temp', label: 'Temperature' },
    { key: 'salinity', label: 'Salinity (ppt)' },
    { key: 'alk', label: 'Alkalinity (dKH)' },
    { key: 'ph', label: 'pH' },
    { key: 'cal', label: 'Calcium (ppm)' },
    { key: 'mag', label: 'Magnesium (ppm)' },
    { key: 'po4', label: 'Phosphate' },
    { key: 'no3', label: 'Nitrate' },
  ];

  const csv = objectsToCSV(logs, columns);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `reefxone-logs-${date}.csv`);
}

/**
 * Export maintenance entries to CSV
 */
export function exportMaintenance(entries: any[]): void {
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Task Type' },
    { key: 'notes', label: 'Notes' },
    { key: 'cost', label: 'Cost' },
    { key: 'repeatInterval', label: 'Repeat Interval (days)' },
  ];

  const csv = objectsToCSV(entries, columns);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `reefxone-maintenance-${date}.csv`);
}

/**
 * Export equipment to CSV
 */
export function exportEquipment(equipment: any[]): void {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'brand', label: 'Brand' },
    { key: 'model', label: 'Model' },
    { key: 'purchaseDate', label: 'Purchase Date' },
    { key: 'purchasePrice', label: 'Price' },
    { key: 'warrantyExpires', label: 'Warranty Expires' },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notes' },
  ];

  const csv = objectsToCSV(equipment, columns);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `reefxone-equipment-${date}.csv`);
}

/**
 * Export livestock to CSV
 */
export function exportLivestock(livestock: any[]): void {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'species', label: 'Species' },
    { key: 'scientificName', label: 'Scientific Name' },
    { key: 'dateAdded', label: 'Date Added' },
    { key: 'source', label: 'Source' },
    { key: 'cost', label: 'Cost' },
    { key: 'status', label: 'Status' },
    { key: 'size', label: 'Size' },
    { key: 'temperament', label: 'Temperament' },
    { key: 'notes', label: 'Notes' },
  ];

  const csv = objectsToCSV(livestock, columns);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `reefxone-livestock-${date}.csv`);
}

/**
 * Export all data at once
 */
export async function exportAllData(): Promise<void> {
  try {
    // Fetch all data
    const [logsRes, maintenanceRes, equipmentRes, livestockRes] = await Promise.all([
      fetch('/api/logs'),
      fetch('/api/maintenance'),
      fetch('/api/equipment'),
      fetch('/api/livestock'),
    ]);

    const logs = await logsRes.json();
    const maintenance = await maintenanceRes.json();
    const equipment = await equipmentRes.json();
    const livestock = await livestockRes.json();

    // Export each type
    if (Array.isArray(logs) && logs.length > 0) exportLogs(logs);
    if (Array.isArray(maintenance) && maintenance.length > 0) exportMaintenance(maintenance);
    if (Array.isArray(equipment) && equipment.length > 0) exportEquipment(equipment);
    if (Array.isArray(livestock) && livestock.length > 0) exportLivestock(livestock);

  } catch (err) {
    console.error('Failed to export data:', err);
    throw err;
  }
}
