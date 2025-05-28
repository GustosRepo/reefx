import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrendChart from "../components/TrendChartWrapper";

export default function HomeScreen() {
  const router = useRouter();
  const [chartData, setChartData] = useState<Record<string, number[]>>({});
  const [labels, setLabels] = useState<string[]>([]);

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
      } catch (err) {
        console.error("Failed to load logs", err);
      }
    };

    loadData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#0ff" }}>REEFX</Text>
        <Text style={{ color: "#ccc", marginTop: 4 }}>Smarter Reefkeeping. Beautifully Synced.</Text>

        {Object.entries(chartData).map(([key, data]) => (
          <View key={key} style={{ marginTop: 32 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
              {key.toUpperCase()}
            </Text>
            <TrendChart parameter={key as "alk" | "ph" | "cal" | "mag" | "po4" | "no3"} data={data} labels={labels} />
          </View>
        ))}

        <View style={{ marginTop: 32 }}>
          <TouchableOpacity
            style={{ padding: 16, backgroundColor: "#0ff", borderRadius: 12, marginBottom: 12 }}
            onPress={() => router.push("/log")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>Log Parameters</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ padding: 16, backgroundColor: "#0cf", borderRadius: 12 }}
            onPress={() => router.push("/history")}
          >
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>View History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}