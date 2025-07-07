import { Dimensions, View, TouchableOpacity, Alert, StyleSheet, Modal, Text } from "react-native";
// @ts-ignore: chart-kit has broken types with Expo SDK 53
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Circle } from "react-native-svg";

function formatToMonthDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${m}/${d}`;
}

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundColor: "#000",
  backgroundGradientFrom: "#0f172a",
  backgroundGradientTo: "#0f172a",
  decimalPlaces: 1,
  color: () => "#0ea5e9",
  labelColor: () => "#94a3b8",
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#3b82f6",
  },
};

type Props = {
  parameter: "temp" | "salinity" | "alk" | "ph" | "cal" | "mag" | "po4" | "no3";
  labels: string[]; // ISO strings: ["2025-06-01", "2025-06-02", ...]
  data: number[];   // matching array of numbers
  labelStyle?: any; // optional
};

export default function TrendChartWrapper({
  parameter,
  labels: parentLabels,
  data: parentData,
  labelStyle,
}: Props) {
  const [eventIndices, setEventIndices] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalEvents, setModalEvents] = useState<string[]>([]);
  const [modalDate, setModalDate] = useState<string>("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const raw = await AsyncStorage.getItem("reef_events");
        if (!raw) {
          setEventIndices(new Set());
          return;
        }
        const parsedEvents: { date: string; label: string }[] = JSON.parse(raw);

        const idxSet = new Set<number>();
        parentLabels.forEach((lbl, i) => {
          if (parsedEvents.find((e) => e.date === lbl)) {
            idxSet.add(i);
          }
        });
        setEventIndices(idxSet);
      } catch (err) {
        console.error("TrendChartWrapper failed to load reef_events:", err);
      }
    };
    loadEvents();
  }, [parentLabels]);

  // Raw plotting: nulls become 0 so chart dips, dots colored to distinguish
  const rawData = parentData.map((v) => (v === null ? 0 : v));

  // Dot colors: transparent for null (now plotted as 0), gray for zero readings, blue for real values
  const dotColors = parentData.map((v) =>
    v === null ? "transparent" : v === 0 ? "#888" : "#3b82f6"
  );

  const chartData = {
    labels: parentLabels.map(formatToMonthDay),
    datasets: [
      {
        data: rawData as number[],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View>
      {/* Parameter header with latest value */}
      <Text style={styles.parameterHeader}>
        {parameter.toUpperCase()}: {
          (() => {
            const latest = parentData.slice().reverse().find((v) => v !== null);
            return latest !== undefined ? latest : "—";
          })()
        }
      </Text>
      {/* @ts-ignore: type conflict workaround */}
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={240}
        chartConfig={{ ...chartConfig }}
        bezier
        verticalLabelRotation={15}
        style={{
          borderRadius: 12,
          paddingBottom: 20,
        }}
        renderDotContent={({ x, y, index }) =>
          eventIndices.has(index) ? (
            <Circle
              key={`event-dot-${index}`}
              cx={x}
              cy={y}
              r="5"
              fill="red"
            />
          ) : null
        }
        getDotColor={(value, index) => dotColors[index]}
        onDataPointClick={({ index }) => {
          AsyncStorage.getItem("reef_events")
            .then((raw) => {
              if (!raw) return;
              const parsedEvents: { date: string; label: string }[] = JSON.parse(raw);
              const clickedDate = parentLabels[index];
              const matchedEvents = parsedEvents
                .filter((e) => e.date === clickedDate)
                .map((e) => e.label);
              if (matchedEvents.length > 0) {
                setModalDate(clickedDate);
                setModalEvents(matchedEvents);
                setShowModal(true);
              }
            })
            .catch((err) => console.error(err));
        }}
      />
      <Text style={[styles.legend, { textAlign: "center", alignSelf: "center" }]}>
        gray dots indicate parameter was not logged.
      </Text>

      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Events on {formatToMonthDay(modalDate)}</Text>
            {modalEvents.map((ev, idx) => (
              <Text key={idx} style={styles.modalText}>
                • {ev}
              </Text>
            ))}
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  parameterHeader: { 
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    color: "#0ff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "left",
    alignSelf: "stretch",
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: "#0ff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  legend: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 8,
    marginLeft: 20,
  },
});