import { StyleSheet } from "react-native";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Modal, Image } from "react-native";
import { Linking } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrendChart from "../../components/TrendChartWrapper";
import { useIsFocused } from "@react-navigation/native";

import { injectAllTestData } from "../../devtools/injectMockData";

useEffect(() => {
  if (__DEV__) {
    injectAllTestData();
  }
}, []);

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();

  // --- STATE HOOKS FOR DATA/CHARTS ---
  const [chartData, setChartData] = useState<Record<string, number[]>>({});
  const [labels, setLabels] = useState<string[]>([]); // ISO dates
  const [warnings, setWarnings] = useState<Record<string, string | null>>({});
  const [overdueMaintenance, setOverdueMaintenance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLogs, setHasLogs] = useState(false);
  const [hasCheckedFirstTime, setHasCheckedFirstTime] = useState(false);

  // --- STATE HOOKS FOR ONBOARDING MODALS ---
  const [showWelcome, setShowWelcome] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [isChecklistLoading, setIsChecklistLoading] = useState(true);

  // === useEffect → check “hasSeenWelcome” and “seenChecklist” flags on first mount ===
  useEffect(() => {
    AsyncStorage.getItem("hasSeenWelcome")
      .then((raw) => {
        if (raw !== "true") {
          // Show Welcome first
          setShowWelcome(true);
          setIsChecklistLoading(false);
        } else {
          // Already saw Welcome → check checklist
          AsyncStorage.getItem("seenChecklist")
            .then((flag) => {
              if (flag !== "true") {
                setShowChecklist(true);
              }
            })
            .finally(() => {
              setIsChecklistLoading(false);
            });
        }
      })
      .catch(() => {
        setShowWelcome(true);
        setIsChecklistLoading(false);
      });
  }, []);

  // === Handler: when user taps “Got it” on the Welcome modal ===
  const handleDismissWelcome = () => {
    AsyncStorage.setItem("hasSeenWelcome", "true").catch(() => {});
    setShowWelcome(false);
    // After welcome, show checklist if not yet seen
    AsyncStorage.getItem("seenChecklist")
      .then((flag) => {
        if (flag !== "true") {
          setShowChecklist(true);
        }
      })
      .finally(() => {
        setIsChecklistLoading(false);
      });
  };

  // --- useFocusEffect → load chart data whenever the screen is focused ---
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const json = await AsyncStorage.getItem("reef_logs");
          const logs: any[] = json ? JSON.parse(json) : [];

          interface ReefLogEntry {
            date: string;
            temp: string;
            salinity: string;
            alk: string;
            ph: string;
            cal: string;
            mag: string;
            po4: string;
            no3: string;
          }

          // 1) Sort by date ascending
          const sortedLogs: ReefLogEntry[] = logs.sort((a, b) => {
            const [ay, am, ad] = a.date.split("-").map(Number);
            const [by, bm, bd] = b.date.split("-").map(Number);
            const adate = new Date(ay, am - 1, ad);
            const bdate = new Date(by, bm - 1, bd);
            return adate.getTime() - bdate.getTime();
          });

          // 2) Take last 7 entries
          const recent: ReefLogEntry[] = sortedLogs.slice(-7);

          // 3) Build number[] arrays
          const newChartData: Record<string, number[]> = {
            temp: [],
            salinity: [],
            alk: [],
            ph: [],
            cal: [],
            mag: [],
            po4: [],
            no3: [],
          };

          recent.forEach((entry) => {
            newChartData.temp.push(parseFloat(entry.temp) || 0);
            newChartData.salinity.push(parseFloat(entry.salinity) || 0);
            newChartData.alk.push(parseFloat(entry.alk) || 0);
            newChartData.ph.push(parseFloat(entry.ph) || 0);
            newChartData.cal.push(parseFloat(entry.cal) || 0);
            newChartData.mag.push(parseFloat(entry.mag) || 0);
            newChartData.po4.push(parseFloat(entry.po4) || 0);
            newChartData.no3.push(parseFloat(entry.no3) || 0);
          });

          setChartData(newChartData);
          setHasLogs(recent.length > 0);
          setHasCheckedFirstTime(true);

          // 4) Labels = ISO dates for reef_events matching
          const labelSet = recent.map((entry) => entry.date as string);
          setLabels(labelSet);

          // 5) Compute warnings
          const thresholdsRaw = await AsyncStorage.getItem("reef_thresholds");
          const thresholds = thresholdsRaw ? JSON.parse(thresholdsRaw) : {};
          const latestWarnings: Record<string, string | null> = {};

          for (const param of Object.keys(newChartData)) {
            const series = newChartData[param];
            const latest = series[series.length - 1];
            const th = thresholds[param];
            if (th) {
              if (latest < th.min) latestWarnings[param] = `⚠️ Too Low (${latest})`;
              else if (latest > th.max) latestWarnings[param] = `⚠️ Too High (${latest})`;
              else latestWarnings[param] = null;
            }
          }
          setWarnings(latestWarnings);

          // 6) Overdue maintenance
          const maintenanceRaw = await AsyncStorage.getItem("reef_maintenance");
          const maintenance = maintenanceRaw ? JSON.parse(maintenanceRaw) : [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const overdueItems = maintenance.filter((entry: any) => {
            if (!entry.repeatInterval) return false;
            const [y, m, d] = entry.date.split("-").map(Number);
            const lastDate = new Date(y, m - 1, d);
            lastDate.setHours(0, 0, 0, 0);
            const daysSince = Math.floor(
              (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysSince >= entry.repeatInterval;
          });
          setOverdueMaintenance(overdueItems);
        } catch (err) {
          console.error("Failed to load logs:", err);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [isFocused])
  );

  // ─── EARLY RETURNS FOR ONBOARDING MODALS ───────────────────────────────
  if (isChecklistLoading) {
    return null;
  }

  // ---- Unified Welcome + Checklist modal ----
  if (showWelcome || showChecklist) {
    return (
      <Modal transparent animationType="fade">
        <View style={styles.checklistOverlay}>
          <View style={styles.checklistBox}>
            <Text style={styles.welcomeTitle}>Welcome to REEFX</Text>
            <Text style={styles.welcomeText}>
              Track your reef’s water parameters, livestock, maintenance, and events—all in one place.
            </Text>

            <Text style={styles.checklistTitle}>Get Started</Text>

            <View style={styles.checklistItem}>
              <Text style={styles.checklistItemTitle}>1. Log Screen</Text>
              <Text style={styles.checklistItemText}>
                Record today’s parameters: temperature, salinity, alkalinity, pH, calcium, magnesium, phosphate, nitrate.
              </Text>
            </View>

            <View style={styles.checklistItem}>
              <Text style={styles.checklistItemTitle}>2. Home (Trends)</Text>
              <Text style={styles.checklistItemText}>
                View 7‑day trend charts with red dots for events. Tap a dot to see details.
              </Text>
            </View>

            <View style={styles.checklistItem}>
              <Text style={styles.checklistItemTitle}>3. Livestock</Text>
              <Text style={styles.checklistItemText}>
                Track fish, corals, and invertebrates. Monitor growth and health.
              </Text>
            </View>

            <View style={styles.checklistItem}>
              <Text style={styles.checklistItemTitle}>4. Maintenance</Text>
              <Text style={styles.checklistItemText}>
                Schedule filter changes, water changes, and equipment tasks.
              </Text>
            </View>

            <View style={styles.checklistItem}>
              <Text style={styles.checklistItemTitle}>5. Settings (Thresholds)</Text>
              <Text style={styles.checklistItemText}>
                Set custom alert ranges so REEFX warns you when parameters drift.
              </Text>
            </View>

            <TouchableOpacity
              onPress={async () => {
                await AsyncStorage.multiSet([
                  ["hasSeenWelcome", "true"],
                  ["seenChecklist", "true"],
                ]).catch(() => {});
                setShowWelcome(false);
                setShowChecklist(false);
              }}
              style={styles.checklistBtn}
            >
              <Text style={styles.checklistBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
  // ---- end unified modal ----


  const labelMap: Record<string, string> = {
    temp: "Temperature (°C)",
    salinity: "Salinity (ppt)",
    alk: "ALK (dKH)",
    ph: "pH",
    cal: "Calcium (ppm)",
    mag: "Magnesium (ppm)",
    po4: "Phosphate (PO₄)",
    no3: "Nitrate (NO₃)",
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#7df9ff" }}>
          REEFX
        </Text>
        <Text style={{ color: "#ccc", marginBottom: 20 }}>Loading your reef logs...</Text>
        {[...Array(5)].map((_, i) => (
          <View
            key={i}
            style={{
              backgroundColor: "#1f2937",
              height: 120,
              borderRadius: 16,
              marginBottom: 16,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                width: `${(i + 1) * 20}%`,
                height: "100%",
              }}
            />
          </View>
        ))}
      </SafeAreaView>
    );
  }

  if (!hasLogs && hasCheckedFirstTime) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text
          style={{
            color: "#7df9ff",
            fontSize: 28,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Welcome to REEFX
        </Text>
        <Text
          style={{
            color: "#ccc",
            fontSize: 16,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Start tracking your reef tank with beautiful trend charts and smart reminders.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/log")}
          style={{
            backgroundColor: "#7df9ff",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontWeight: "bold", color: "#000" }}>➕ Add Your First Log</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: "#ccc", marginTop: 4 }}>
            Smarter Reefkeeping. Beautifully Synced.
          </Text>
        </View>

        {overdueMaintenance.length > 0 && (
          <View
            style={{
              backgroundColor: "#1e293b",
              padding: 12,
              borderRadius: 10,
              marginTop: 16,
            }}
          >
            <Text
              style={{ color: "#f87171", fontWeight: "bold", marginBottom: 4 }}
            >
              🔔 Maintenance Due
            </Text>
            {overdueMaintenance.slice(0, 3).map((item, index) => (
              <Text key={index} style={{ color: "#fff" }}>
                • {item.type} ({item.date})
              </Text>
            ))}
            {overdueMaintenance.length > 3 && (
              <Text
                style={{
                  color: "#ccc",
                  fontStyle: "italic",
                  marginTop: 4,
                }}
              >
                + {overdueMaintenance.length - 3} more...
              </Text>
            )}
          </View>
        )}

        {Object.entries(chartData).map(([key, data]) => (
          <View
            key={key}
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 16,
              padding: 12,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              {labelMap[key] || key.toUpperCase()}
            </Text>
            {warnings[key] && (
              <Text style={{ color: "#ff4d4d", marginTop: 4, fontWeight: "600" }}>
                {warnings[key]}
              </Text>
            )}
            <TrendChart
              parameter={key as
                | "temp"
                | "salinity"
                | "alk"
                | "ph"
                | "cal"
                | "mag"
                | "po4"
                | "no3"}
              data={data}
              labels={labels}
              labelStyle={{
                fontSize: 10,
                textAlign: "center",
                transform: [{ rotate: "-30deg" }],
              }}
            />
            <View style={{ marginTop: 12, alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => router.push(`/trend/${key}`)}
                style={{
                  backgroundColor: "#0ff",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#000", fontWeight: "bold", marginRight: 6 }}>
                  View Full Trend
                </Text>
                <Text style={{ color: "#000", fontWeight: "bold" }}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ marginTop: 32 }}>
          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: "#7df9ff",
              borderRadius: 12,
              marginBottom: 20,
            }}
            onPress={() => router.push("/log")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>
              Log Parameters
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: "#8e9cff",
              borderRadius: 12,
              marginBottom: 20,
            }}
            onPress={() => router.push("/history")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>
              View History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ padding: 16, backgroundColor: "#4ade80", borderRadius: 12 }}
            onPress={() => router.push("/events")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>
              📅 View All Events
            </Text>
          </TouchableOpacity>
        </View>


        <View style={{ marginTop: 48 }}>
          <Text
            style={{ color: "#ccc", fontSize: 16, fontWeight: "600", marginBottom: 12 }}
          >
            Tools
          </Text>

          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: "#0ea5e9",
              borderRadius: 12,
              marginBottom: 16,
            }}
            onPress={() => router.push("/maintenance")}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              🛠 Maintenance Tracker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: "#f472b6",
              borderRadius: 12,
              marginBottom: 16,
            }}
            onPress={() => router.push("/livestock")}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              🐠 Livestock Tracker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: "#facc15",
              borderRadius: 12,
            }}
            onPress={() => router.push("/settings")}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              ⚙️ Set Alert Thresholds
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              "mailto:admin@code-wrx.com?subject=REEFX Feedback&body=Hey! I have some thoughts..."
            )
          }
          style={{ marginTop: 24 }}
        >
          <Text
            style={{
              color: "#7df9ff",
              fontSize: 14,
              textAlign: "center",
              textDecorationLine: "underline",
            }}
          >
            📬 Send Feedback
          </Text>
        </TouchableOpacity>
{/* <TouchableOpacity onPress={injectAllTestData} style={{ padding: 12, backgroundColor: "#0ff" }}>
  <Text style={{ color: "#000" }}>Inject Test Data</Text>
</TouchableOpacity> */}
        <Text
          style={{
            color: "#444",
            textAlign: "center",
            fontSize: 12,
            marginTop: 32,
          }}
        >
          REEFX v0.9.0 Beta
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  quickTrends: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 24,
  },
  trendButton: {
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 6,
  },
  trendButtonText: {
    color: "#7df9ff",
    fontWeight: "600",
  },

  welcomeOverlay: {
    flex: 1,
    backgroundColor: "#000a",
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeBox: {
    backgroundColor: "#111",
    padding: 24,
    borderRadius: 12,
    width: "80%",
  },
  welcomeTitle: {
    color: "#0ff",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  welcomeText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  welcomeBtn: {
    backgroundColor: "#0ff",
    paddingVertical: 12,
    borderRadius: 8,
  },
  welcomeBtnText: {
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },

  checklistOverlay: {
    flex: 1,
    backgroundColor: "#000a",
    justifyContent: "center",
    alignItems: "center",
  },
  checklistBox: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
  checklistTitle: {
    color: "#0ff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  checklistItem: {
    marginBottom: 12,
  },
  checklistItemTitle: {
    color: "#7df9ff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  checklistItemText: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
  },
  checklistBtn: {
    backgroundColor: "#0ff",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  checklistBtnText: {
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});