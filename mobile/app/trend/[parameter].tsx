import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function ParameterTrend() {
  const { parameter } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [range, setRange] = useState(7);
  const [change, setChange] = useState<number | null>(null);
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
  const [avg, setAvg] = useState<number | null>(null);
  const [events, setEvents] = useState<{ date: string; label: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [eventLabel, setEventLabel] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      const stored = await AsyncStorage.getItem("reef_logs");
      if (!stored) return;

      try {
        const logs = JSON.parse(stored);
        logs.sort((a: any, b: any) => {
          // Parse "YYYY-MM-DD" into a local Date at midnight
          const [ay, am, ad] = a.date.split("-").map(Number);
          const [by, bm, bd] = b.date.split("-").map(Number);
          const adate = new Date(ay, am - 1, ad);
          const bdate = new Date(by, bm - 1, bd);
          return adate.getTime() - bdate.getTime();
        });
        const recent = logs;

        const values = recent.map((entry: any) =>
          parseFloat(entry[parameter as string])
        );

        const dateLabels = recent.map((entry: any) => {
          const [y, m, dNum] = entry.date.split("-").map(Number);
          const dLoc = new Date(y, m - 1, dNum);
          return `${dLoc.getMonth() + 1}/${dLoc.getDate()}`;
        });

        setData(values);
        setLabels(dateLabels);

        if (values.length > 1) {
          const delta = values[values.length - 1] - values[0];
          const minimum = Math.min(...values);
          const maximum = Math.max(...values);
          const average =
            values.reduce((a: number, b: number) => a + b, 0) / values.length;

          setChange(delta);
          setMin(minimum);
          setMax(maximum);
          setAvg(parseFloat(average.toFixed(2)));
        }

        const rawEvents = await AsyncStorage.getItem("reef_events");
        if (rawEvents) setEvents(JSON.parse(rawEvents));
      } catch (err) {
        console.error("Failed to parse reef logs:", err);
      }
    };

    fetchLogs();
  }, [range, parameter]);

  const handleAddEvent = async () => {
    if (!eventLabel.trim()) {
      Alert.alert("Label required", "Please enter a short description.");
      return;
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const year = todayDate.getFullYear();
    const month = (todayDate.getMonth() + 1).toString().padStart(2, "0");
    const day = todayDate.getDate().toString().padStart(2, "0");
    const today = `${year}-${month}-${day}`;
    const newEvent = { date: today, label: eventLabel };
    const updated = [...events, newEvent];
    setEvents(updated);
    await AsyncStorage.setItem("reef_events", JSON.stringify(updated));
    setEventLabel("");
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace("/")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {Array.isArray(parameter)
          ? parameter[0]?.toUpperCase()
          : parameter?.toUpperCase()} Trend
      </Text>

      {change !== null && (
        <View style={styles.analysisBox}>
          <Text style={styles.analysisText}>
            Change: {change >= 0 ? "+" : ""}
            {change.toFixed(2)}
          </Text>
          <Text style={styles.analysisText}>
            Avg: {avg} | Min: {min} | Max: {max}
          </Text>
          {change !== null && (() => {
            const alertThresholds: { [key: string]: number } = {
              alk: 0.5,
              cal: 20,
              ph: 0.2,
              mag: 30,
              nitrate: 5,
              phosphate: 0.05,
            };

            const threshold = alertThresholds[parameter as string];

            if (threshold && Math.abs(change) > threshold) {
              return (
                <Text style={styles.alertText}>
                  ⚠️ Significant {(Array.isArray(parameter) ? parameter[0] : parameter)?.toUpperCase()} change detected
                </Text>
              );
            }

            return null;
          })()}
        </View>
      )}

      {data.length > 0 ? (
        <>
          {/* @ts-ignore */}
          <LineChart
            data={{ labels, datasets: [{ data }] }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#000",
              backgroundGradientFrom: "#000",
              backgroundGradientTo: "#000",
              color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
              labelColor: () => "#ccc",
            }}
            style={{ borderRadius: 16 }}
          />
        </>
      ) : (
        <Text style={styles.noData}>No data available for {parameter}</Text>
      )}

      {labels.map((label, index) => {
        const matchingEvents = events.filter((e) => {
          const [m, d] = label.split("/");
          const labelDate = new Date();
          labelDate.setMonth(parseInt(m) - 1);
          labelDate.setDate(parseInt(d));
          return (
            new Date(e.date).getMonth() === labelDate.getMonth() &&
            new Date(e.date).getDate() === labelDate.getDate()
          );
        });

        return matchingEvents.length > 0 ? (
          <Text key={index} style={styles.eventText}>
            {label}: {matchingEvents.map((e) => e.label).join(", ")}
          </Text>
        ) : null;
      })}

      <View style={styles.rangeButtons}>
        {[7, 14, 30].map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRange(r)}
            style={[
              styles.rangeButton,
              range === r && styles.rangeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.rangeButtonText,
                range === r && styles.rangeButtonTextActive,
              ]}
            >
              {r}d
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={styles.addEventButton}
      >
        <Text style={styles.addEventText}>+ Add Event</Text>
      </TouchableOpacity>

      <Modal transparent visible={showModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Reef Event</Text>
            <TextInput
              placeholder="e.g. 5mL AFR"
              placeholderTextColor="#999"
              style={styles.input}
              value={eventLabel}
              onChangeText={setEventLabel}
            />
            <TouchableOpacity onPress={handleAddEvent} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20 },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    marginBottom: 16,
  },
  backButtonText: { color: "#7df9ff", fontWeight: "bold" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0ff",
    marginBottom: 20,
    textAlign: "center",
  },
  analysisBox: {
    marginBottom: 20,
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
  },
  analysisText: {
    color: "#7df9ff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
  },
  alertText: {
    color: "#ff4d4d",
    fontWeight: "bold",
    textAlign: "center",
  },
  noData: {
    color: "#ccc",
    fontStyle: "italic",
    textAlign: "center",
  },
  rangeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  rangeButton: {
    backgroundColor: "#1e293b",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  rangeButtonActive: { backgroundColor: "#0ff" },
  rangeButtonText: { color: "#ccc" },
  rangeButtonTextActive: { color: "#000", fontWeight: "bold" },
  eventText: {
    color: "#7df9ff",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  addEventButton: {
    marginTop: 30,
    backgroundColor: "#0ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  addEventText: {
    color: "#000",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000a",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    color: "#0ff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#0ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveBtnText: {
    textAlign: "center",
    color: "#000",
    fontWeight: "bold",
  },
  cancelBtn: {
    alignItems: "center",
    padding: 10,
  },
  cancelBtnText: {
    color: "#999",
  },
});