// File: app/utils/warningUtils.test.ts

import { getWarning, Threshold } from "./warningUtils";

describe("getWarning", () => {
  const threshold: Threshold = { min: 10, max: 20 };

  it("returns null if no threshold provided", () => {
    expect(getWarning(15, undefined)).toBeNull();
  });

  it("returns a 'Too Low' warning when below min", () => {
    expect(getWarning(5, threshold)).toBe("⚠️ Too Low (5)");
  });

  it("returns a 'Too High' warning when above max", () => {
    expect(getWarning(25, threshold)).toBe("⚠️ Too High (25)");
  });

  it("returns null when value is exactly on min or max", () => {
    expect(getWarning(10, threshold)).toBeNull();
    expect(getWarning(20, threshold)).toBeNull();
  });

  it("returns null when value is within range", () => {
    expect(getWarning(15, threshold)).toBeNull();
  });
});