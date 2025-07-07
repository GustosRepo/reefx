import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

interface ReefLogEntry {
  date: string;
  [key: string]: string | number | undefined;
}
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import AdBanner from "../../components/AdBanner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// Optional: normalize known parameter keys
const PARAM_MAP: Record<string, string> = {
  alk: "alk",
  cal: "cal",
  mag: "mag",
  po4: "po4",
  no3: "no3",
  ph: "ph",
  temp: "temp",
  salinity: "salinity",
};

export default function ParameterTrend() {
  const { parameter } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [range, setRange] = useState<number | "all">(7);
  const [change, setChange] = useState<number | null>(null);
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
  const [avg, setAvg] = useState<number | null>(null);
  const [events, setEvents] = useState<{ date: string; label: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [eventLabel, setEventLabel] = useState("");
  const [recent, setRecent] = useState<ReefLogEntry[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const stored = await AsyncStorage.getItem("reef_logs");
      if (!stored) return;

      try {
        const logs = JSON.parse(stored);
        logs.sort((a: any, b: any) => {
          const [ay, am, ad] = a.date.split("-").map(Number);
          const [by, bm, bd] = b.date.split("-").map(Number);
          const adate = new Date(ay, am - 1, ad);
          const bdate = new Date(by, bm - 1, bd);
          return adate.getTime() - bdate.getTime();
        });

        const now = new Date();
        const recent = range === "all"
          ? logs
          : logs.filter((log: any) => {
              const [y, m, d] = log.date.split("-").map(Number);
              const logDate = new Date(y, m - 1, d);
              const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
              return diffDays <= range;
            });

        const key = PARAM_MAP[parameter as string] || (parameter as string);

        interface ReefLogEntry {
          date: string;
          [key: string]: string | number | undefined;
        }

        const values = (recent as ReefLogEntry[])
          .map((entry: ReefLogEntry) => {
            const raw = entry[key];
            const num = typeof raw === "number" ? raw : parseFloat(raw as string);
            return isNaN(num) ? null : num;
          })
          .filter((v): v is number => v !== null);

        // Simplified date label logic to reduce label density for long ranges
        const formatDate = (dateStr: string) => {
          const [y, m, d] = dateStr.split("-").map(Number);
          return `${m}/${d}`;
        };
        const labelInterval = values.length > 90 ? 30
                              : values.length > 60 ? 30
                              : values.length > 30 ? 15
                              : values.length > 14 ? 7
                              : values.length > 7 ? 3
                              : 1;
        const dateLabels = recent
          .map((entry: any, idx: number) =>
            idx % labelInterval === 0 ? formatDate(entry.date) : ""
          )
          .slice(-values.length);

        setData(values);
        setLabels(dateLabels);
        (setRecent => setRecent(recent))(setRecent);

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
        } else {
          setChange(null);
          setMin(null);
          setMax(null);
          setAvg(null);
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
      <ScrollView>
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
          {(() => {
            const alertThresholds: { [key: string]: number } = {
              alk: 0.5,
              cal: 20,
              ph: 0.2,
              mag: 30,
              nitrate: 5,
              phosphate: 0.05,
            };

            const key = Array.isArray(parameter)
              ? parameter[0]
              : parameter;
            const threshold = alertThresholds[key as string];

            if (threshold && Math.abs(change) > threshold) {
              return (
                <Text style={styles.alertText}>
                  ⚠️ Significant {key?.toUpperCase()} change detected
                </Text>
              );
            }

            return null;
          })()}
        </View>
      )}

      {data.length > 0 ? (
        <>
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

      {/*
        Display events as a single-line per event in M/D: label format, filtered by range.
      */}
      {(() => {
        const now = new Date();
        const sortedEvents = [...events]
          .filter((e) => {
            if (range === "all") return true;
            const [y, m, d] = e.date.split("-").map(Number);
            const eventDate = new Date(y, m - 1, d);
            const diffDays = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= range;
          })
          .sort((a, b) => a.date.localeCompare(b.date));
        const formatDateLabel = (iso: string) => {
          const [y, m, d] = iso.split("-").map(Number);
          return `${m}/${d}`;
        };
        return sortedEvents.map((e, i) => (
          <Text key={i} style={styles.eventText}>
            {formatDateLabel(e.date)}: {e.label}
          </Text>
        ));
      })()}

      <View style={styles.rangeButtons}>
        {([7, 14, 30, "all"] as (number | "all")[]).map((r) => (
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
              {r === "all" ? "All" : `${r}d`}
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
      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20, paddingBottom: 20 },
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
    alignSelf: "center",
    width: "100%",
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