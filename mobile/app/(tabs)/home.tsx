import { StyleSheet } from "react-native";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrendChart from "../../components/TrendChartWrapper";

export default function HomeScreen() {
  const router = useRouter();
  const [chartData, setChartData] = useState<Record<string, number[]>>({});
  const [labels, setLabels] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const json = await AsyncStorage.getItem("reef_logs");
        const logs = json ? JSON.parse(json) : [];

        const recent = logs.slice(-7); // last 7 entries

        const newChartData: Record<string, number[]> = {
          alk: [],
          ph: [],
          cal: [],
          mag: [],
          po4: [],
          no3: [],
        };

        recent.forEach((entry: any) => {
          newChartData.alk.push(parseFloat(entry.alk));
          newChartData.ph.push(parseFloat(entry.ph));
          newChartData.cal.push(parseFloat(entry.cal));
          newChartData.mag.push(parseFloat(entry.mag));
          newChartData.po4.push(parseFloat(entry.po4));
          newChartData.no3.push(parseFloat(entry.no3));
        });

        setChartData(newChartData);

        const labelSet = recent.map((entry: any) => {
          const d = new Date(entry.date);
          return d.toLocaleDateString("en-US", { weekday: "short" });
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
      } catch (err) {
        console.error("Failed to load logs", err);
      }
    };

    loadData();
  }, []);

  const labelMap: Record<string, string> = {
    alk: "ALK (dKH)",
    ph: "pH",
    cal: "Calcium (ppm)",
    mag: "Magnesium (ppm)",
    po4: "Phosphate (PO₄)",
    no3: "Nitrate (NO₃)",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#7df9ff" }}>REEFX</Text>
        <Text style={{ color: "#ccc", marginTop: 4 }}>Smarter Reefkeeping. Beautifully Synced.</Text>

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
            <TrendChart parameter={key as "alk" | "ph" | "cal" | "mag" | "po4" | "no3"} data={data} labels={labels} />
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
          {["alk", "ph", "cal", "mag", "po4", "no3"].map((param) => (
            <TouchableOpacity
              key={param}
              style={styles.trendButton}
              onPress={() => router.push(`/trend/${param}`)}
            >
              <Text style={styles.trendButtonText}>{param.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ marginTop: 32 }}>
          <TouchableOpacity
            style={{ padding: 16, backgroundColor: "#facc15", borderRadius: 12 }}
            onPress={() => router.push("/settings")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>⚙️ Set Alert Thresholds</Text>
          </TouchableOpacity>
        </View>
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