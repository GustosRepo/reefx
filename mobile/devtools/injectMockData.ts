import AsyncStorage from "@react-native-async-storage/async-storage";

function randomDateRange(days: number): string[] {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split("T")[0]); // "YYYY-MM-DD"
  }
  return dates;
}

function maybeNull(value: string, chance = 0.3): string | null {
  return Math.random() < chance ? null : value;
}

function generateTestLogs(): any[] {
  return randomDateRange(60).map((date) => ({
    date,
    temp: maybeNull((76 + Math.random()).toFixed(1)),
    salinity: maybeNull((1.024 + Math.random() * 0.002).toFixed(3)),
    alk: maybeNull((7.5 + Math.random() * 1.5).toFixed(1)),
    ph: maybeNull((7.7 + Math.random() * 0.3).toFixed(2)),
    cal: maybeNull((390 + Math.random() * 30).toFixed(0)),
    mag: maybeNull((1280 + Math.random() * 50).toFixed(0)),
    po4: maybeNull((0.01 + Math.random() * 0.08).toFixed(3)),
    no3: maybeNull((2 + Math.random() * 5).toFixed(1)),
  }));
}

function generateTestEvents(dates: string[]): { date: string; label: string }[] {
  const labels = [
    "5mL AFR", "Water change", "Fed Reef Roids", "Dosed CoralAmino", "Added new frag",
    "Adjusted light", "Cleaned skimmer", "Chaeto harvest", "Trimmed GSP", "Manual top-off"
  ];
  return dates
    .filter(() => Math.random() < 0.25)
    .map((date) => ({
      date,
      label: labels[Math.floor(Math.random() * labels.length)],
    }));
}

function generateTestMaintenance(dates: string[]): { date: string; type: string; notes: string; cost: number; repeat: boolean }[] {
  const types = [
    "Clean glass",
    "Change filter sock",
    "Scrub rocks",
    "Check salinity",
    "Clean powerhead",
    "Replace carbon",
    "Test backup heater"
  ];
  const notesOptions = [
    "Monthly routine",
    "Quick spot clean",
    "Full deep clean",
    "Checked for leaks",
    "Observed flow issues"
  ];
  return dates
    .filter(() => Math.random() < 0.2)
    .map((date) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const notes = notesOptions[Math.floor(Math.random() * notesOptions.length)];
      const cost = parseFloat((Math.random() * 50 + 5).toFixed(2)); // $5–$55
      const repeat = Math.random() < 0.3; // 30% recurring
      return { date, type, notes, cost, repeat };
    });
}

function generateTestLivestock(): { id: string; name: string; type: string; added: string }[] {
  const names = [
    "Clownfish", "Zoanthids", "Hammer Coral", "Cleaner Shrimp", "Snails",
    "Acropora", "Torch Coral", "Yellow Tang", "Goby", "Bubble Tip Anemone"
  ];
  const types = [
    "Fish", "Coral", "Coral", "Invertebrate", "Invertebrate",
    "Coral", "Coral", "Fish", "Fish", "Anemone"
  ];
  const today = new Date();
  const count = Math.floor(5 + Math.random() * 5); // 5–10 entries

  return Array.from({ length: count }).map((_, i) => ({
    id: `ls-${i}`,
    name: names[i % names.length],
    type: types[i % types.length],
    added: new Date(today.getTime() - Math.random() * 90 * 86400000)
      .toISOString()
      .split("T")[0],
  }));
}

// New: Populate per-parameter history keys
async function saveHistoryFromLogs(logs: any[]) {
  const params = ["temp", "salinity", "alk", "ph", "cal", "mag", "po4", "no3"];
  for (const param of params) {
    const history = logs
      .filter((log) => log[param] !== null)
      .map((log) => ({
        date: log.date,
        [param]: log[param],
      }));
    await AsyncStorage.setItem(`${param}History`, JSON.stringify(history));
  }
}

export const injectAllTestData = async () => {
  const logs = generateTestLogs();
  const events = generateTestEvents(logs.map((l) => l.date));
  const maintenance = generateTestMaintenance(logs.map((l) => l.date));
  const livestock = generateTestLivestock();

  await AsyncStorage.setItem("reef_logs", JSON.stringify(logs));
  await AsyncStorage.setItem("reef_events", JSON.stringify(events));
  await AsyncStorage.setItem("reef_maintenance", JSON.stringify(maintenance));
  await AsyncStorage.setItem("reef_livestock", JSON.stringify(livestock));

  await saveHistoryFromLogs(logs);

  console.log("✅ Injected full test data: logs, events, maintenance, livestock, history.");
};