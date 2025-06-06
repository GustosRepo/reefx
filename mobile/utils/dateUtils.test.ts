// File: app/utils/dateUtils.test.ts

import { parseYYYYMMDD, sortLogsByDate, LogEntry } from "./dateUtils";

describe("parseYYYYMMDD", () => {
  it("parses valid date strings into local-midnight Date", () => {
    const d = parseYYYYMMDD("2025-06-03");
    expect(d).not.toBeNull();
    if (d) {
      expect(d.getFullYear()).toBe(2025);
      expect(d.getMonth()).toBe(5); // month is zero-based (0=Jan, so 5=June)
      expect(d.getDate()).toBe(3);
      expect(d.getHours()).toBe(0);
      expect(d.getMinutes()).toBe(0);
      expect(d.getSeconds()).toBe(0);
    }
  });

  it("returns null for invalid format", () => {
    expect(parseYYYYMMDD("06/03/2025")).toBeNull();
    expect(parseYYYYMMDD("2025-6-3")).toBeNull();
    expect(parseYYYYMMDD("abcd-ef-gh")).toBeNull();
  });

  it("returns null for nonsensical dates", () => {
    expect(parseYYYYMMDD("2025-13-01")).toBeNull();  // month 13 does not exist
    expect(parseYYYYMMDD("2025-02-30")).toBeNull();  // Feb 30 does not exist
    expect(parseYYYYMMDD("0000-00-00")).toBeNull();
  });
});

describe("sortLogsByDate", () => {
  const sample: LogEntry[] = [
    { date: "2025-06-01", temp: "25" },
    { date: "2025-05-30", temp: "24" },
    { date: "2025-06-03", temp: "26" },
    { date: "2025-06-02", temp: "25.5" },
    { date: "invalid-date", temp: "0" },
  ];

  it("sorts by ascending date, placing invalid dates first", () => {
    const sorted = sortLogsByDate(sample);
    // invalid-date (parsed as null) should come first
    expect(sorted[0].date).toBe("invalid-date");
    // then 2025-05-30, 2025-06-01, 2025-06-02, 2025-06-03
    expect(sorted.slice(1).map((e) => e.date)).toEqual([
      "2025-05-30",
      "2025-06-01",
      "2025-06-02",
      "2025-06-03",
    ]);
  });

  it("does not mutate the original array", () => {
    const copy = [...sample];
    const sorted = sortLogsByDate(sample);
    expect(sample).toEqual(copy);      // original array unchanged
    expect(sorted).not.toBe(sample);   // sorted is a new array
  });
});