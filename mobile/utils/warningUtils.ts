// File: app/utils/warningUtils.ts

export type Threshold = { min: number; max: number };

/**
 * Returns a warning string if `latest` is outside the threshold.
 * - If latest < min: "⚠️ Too Low (latest)"
 * - If latest > max: "⚠️ Too High (latest)"
 * - Otherwise, returns null.
 */
export function getWarning(latest: number, th?: Threshold): string | null {
  if (!th) return null;
  if (latest < th.min) return `⚠️ Too Low (${latest})`;
  if (latest > th.max) return `⚠️ Too High (${latest})`;
  return null;
}