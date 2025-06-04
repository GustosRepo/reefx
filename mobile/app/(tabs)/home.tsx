import { StyleSheet } from "react-native";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { Linking } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrendChart from "../../components/TrendChartWrapper";
import { useIsFocused } from "@react-navigation/native";

export default function HomeScreen() {
  const router = useRouter();
  const [chartData, setChartData] = useState<Record<string, number[]>>({});
  const [labels, setLabels] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<Record<string, string | null>>({});
  const [overdueMaintenance, setOverdueMaintenance] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [hasLogs, setHasLogs] = useState(false);
  const [hasCheckedFirstTime, setHasCheckedFirstTime] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const json = await AsyncStorage.getItem("reef_logs");
          const logs = json ? JSON.parse(json) : [];

          interface ReefLogEntry {
            date: string;
            alk: string;
            ph: string;
            cal: string;
            mag: string;
            po4: string;
            no3: string;
            temp?: string;
            salinity?: string;
          }

          interface Thresholds {
            [key: string]: {
              min: number;
              max: number;
            };
          }

          interface MaintenanceEntry {
            type: string;
            date: string;
            repeatInterval?: number;
            [key: string]: any;
          }

          const sortedLogs: ReefLogEntry[] = (logs as ReefLogEntry[]).sort(
            (a: ReefLogEntry, b: ReefLogEntry) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          const recent: ReefLogEntry[] = sortedLogs.slice(-7);

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

          recent.forEach((entry: any) => {
            newChartData.temp.push(parseFloat(entry.temp));
            newChartData.salinity.push(parseFloat(entry.salinity));
            newChartData.alk.push(parseFloat(entry.alk));
            newChartData.ph.push(parseFloat(entry.ph));
            newChartData.cal.push(parseFloat(entry.cal));
            newChartData.mag.push(parseFloat(entry.mag));
            newChartData.po4.push(parseFloat(entry.po4));
            newChartData.no3.push(parseFloat(entry.no3));
          });

          setChartData(newChartData);
          setHasLogs(recent.length > 0);
          setHasCheckedFirstTime(true);

          const labelSet = recent.map((entry: any) => {
            const d = new Date(entry.date);
            const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
            const date = `${d.getMonth() + 1}/${d.getDate()}`;
            return `${weekday}\n${date}`;
          });

          setLabels(labelSet);

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

          const maintenanceRaw = await AsyncStorage.getItem("reef_maintenance");
          const maintenance = maintenanceRaw ? JSON.parse(maintenanceRaw) : [];
          const today = new Date();
          const overdueItems = maintenance.filter((entry: any) => {
            if (!entry.repeatInterval) return false;
            const lastDate = new Date(entry.date);
            const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysSince >= entry.repeatInterval;
          });
          setOverdueMaintenance(overdueItems);
        } catch (err) {
          console.error("Failed to load logs", err);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [])
  );

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
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#7df9ff" }}>REEFX</Text>
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
                // Note: actual shimmer animation would need Animated API or a library
              }}
            />
          </View>
        ))}
      </SafeAreaView>
    );
  }

  if (!hasLogs && hasCheckedFirstTime) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ color: "#7df9ff", fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 16 }}>Welcome to REEFX</Text>
        <Text style={{ color: "#ccc", fontSize: 16, textAlign: "center", marginBottom: 32 }}>
          Start tracking your reef tank with beautiful trend charts and smart reminders.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/log")}
          style={{ backgroundColor: "#7df9ff", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}
        >
          <Text style={{ fontWeight: "bold", color: "#000" }}>➕ Add Your First Log</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#7df9ff" }}>REEFX</Text>
        <Text style={{ color: "#ccc", marginTop: 4 }}>Smarter Reefkeeping. Beautifully Synced.</Text>
        {overdueMaintenance.length > 0 && (
          <View style={{ backgroundColor: "#1e293b", padding: 12, borderRadius: 10, marginTop: 16 }}>
            <Text style={{ color: "#f87171", fontWeight: "bold", marginBottom: 4 }}>🔔 Maintenance Due</Text>
            {overdueMaintenance.slice(0, 3).map((item, index) => (
              <Text key={index} style={{ color: "#fff" }}>
                • {item.type} ({item.date})
              </Text>
            ))}
            {overdueMaintenance.length > 3 && (
              <Text style={{ color: "#ccc", fontStyle: "italic", marginTop: 4 }}>
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
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              {labelMap[key] || key.toUpperCase()}
            </Text>
            {warnings[key] && (
              <Text style={{ color: "#ff4d4d", marginTop: 4, fontWeight: "600" }}>
                {warnings[key]}
              </Text>
            )}
            <TrendChart
              parameter={key as "temp" | "salinity" | "alk" | "ph" | "cal" | "mag" | "po4" | "no3"}
              data={data}
              labels={labels}
              labelStyle={{
                fontSize: 10,
                textAlign: "center",
                transform: [{ rotate: "-30deg" }],
              }}
            />
          </View>
        ))}

        <View style={{ marginTop: 32 }}>
          <TouchableOpacity
            style={{ padding: 16, backgroundColor: "#7df9ff", borderRadius: 12, marginBottom: 20 }}
            onPress={() => router.push("/log")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>Log Parameters</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ padding: 16, backgroundColor: "#8e9cff", borderRadius: 12, marginBottom: 20 }}
            onPress={() => router.push("/history")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>View History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ padding: 16, backgroundColor: "#4ade80", borderRadius: 12 }}
            onPress={() => router.push("/events")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>📅 View All Events</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: "#aaa", fontSize: 16, textAlign: "center", marginTop: 32 }}>
          Tap any parameter below to explore its detailed trend chart.
        </Text>
        <View style={styles.quickTrends}>
          {["temp", "salinity", "alk", "ph", "cal", "mag", "po4", "no3"].map((param) => (
            <TouchableOpacity
              key={param}
              style={styles.trendButton}
              onPress={() => router.push(`/trend/${param}`)}
            >
              <Text style={styles.trendButtonText}>{param.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ marginTop: 48 }}>
          <Text style={{ color: "#ccc", fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            Tools
          </Text>

          <TouchableOpacity
            style={{ padding: 16, backgroundColor: "#0ea5e9", borderRadius: 12, marginBottom: 16 }}
            onPress={() => router.push("/maintenance")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold", color: "#fff" }}>
              🛠 Maintenance Tracker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ padding: 16, backgroundColor: "#f472b6", borderRadius: 12, marginBottom: 16 }}
            onPress={() => router.push("/livestock")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold", color: "#fff" }}>
              🐠 Livestock Tracker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ padding: 16, backgroundColor: "#facc15", borderRadius: 12 }}
            onPress={() => router.push("/settings")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>⚙️ Set Alert Thresholds</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL("mailto:admin@code-wrx.com?subject=REEFX Feedback&body=Hey! I have some thoughts...")
          }
          style={{ marginTop: 24 }}
        >
          <Text style={{ color: "#7df9ff", fontSize: 14, textAlign: "center", textDecorationLine: "underline" }}>
            📬 Send Feedback
          </Text>
        </TouchableOpacity>
        <Text style={{ color: "#444", textAlign: "center", fontSize: 12, marginTop: 32 }}>
          REEFX v0.9.0 Beta
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    color: "#ccc",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
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
});