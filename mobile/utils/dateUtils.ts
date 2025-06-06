// File: mobile/utils/dateUtils.ts

/**
 * Given a YYYY-MM-DD string, returns a local-midnight Date object.
 * If the input is invalid (format or non-existent month/day), returns null.
 */
export function parseYYYYMMDD(str: string): Date | null {
  // Must match exactly four-digit year, two-digit month, two-digit day
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;

  const [year, month, day] = str.split("-").map(Number);

  // Month must be 1–12
  if (month < 1 || month > 12) return null;

  // Day must be 1–daysInThatMonth
  // Create a temporary date at the last day of that month by using day=0 on next month:
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return null;

  // Now construct a Date object at local midnight
  const dt = new Date(year, month - 1, day);
  dt.setHours(0, 0, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
}

export type LogEntry = { date: string; [key: string]: any };

/**
 * Sorts an array of log entries (each with a .date: string field)
 * ascending by local-midnight date. Invalid dates (parseYYYYMMDD → null)
 * are treated as “earliest” and sorted to the front.
 */
export function sortLogsByDate(entries: LogEntry[]): LogEntry[] {
  return [...entries].sort((a, b) => {
    const da = parseYYYYMMDD(a.date);
    const db = parseYYYYMMDD(b.date);

    if (!da && !db) return 0;
    if (!da) return -1;
    if (!db) return 1;
    return da.getTime() - db.getTime();
  });
}