import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import EditLogModal from "../../components/EditLogModal";

// ReefForm type should match the structure used in log.tsx
export type ReefForm = {
    date: string;
    temp: string | number;
    alk: string | number;
    ph: string | number;
    cal: string | number;
    mag: string | number;
    po4: string | number;
    no3: string | number;
    salinity?: string | number; // Optional if not used in history
};

export default function HistoryScreen() {
    const [logs, setLogs] = useState<ReefForm[]>([]);
    const router = useRouter();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState<ReefForm | null>(null);
    const { refresh } = useLocalSearchParams();

    useEffect(() => {
        const fetchLogs = async () => {
            const stored = await AsyncStorage.getItem("reef_logs");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        const sorted = parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        setLogs(sorted);
                    }
                } catch (err) {
                    console.error("Failed to parse logs:", err);
                }
            }
        };
        fetchLogs();
    }, [refresh]);

    const deleteLog = async (index: number) => {
        try {
            const updatedLogs = logs.filter((_, i) => i !== index);
            setLogs(updatedLogs);
            await AsyncStorage.setItem("reef_logs", JSON.stringify(updatedLogs));
        } catch (err) {
            console.error("Failed to delete log:", err);
        }
    };

    return (
        <>
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Past Reef Logs</Text>


            {logs.length === 0 ? (
                <Text style={styles.empty}>No logs found.</Text>
            ) : (
                logs.map((log, index) => (
                  <View key={index} style={styles.card}>
                    <Text style={styles.date}>{log.date}</Text>
                    <Text style={styles.label}>Temperature: {log.temp} °C</Text>
                    <Text style={styles.label}>Salinity: {log.salinity} ppt</Text>
                    <Text style={styles.label}>ALK: {log.alk} dKH</Text>
                    <Text style={styles.label}>pH: {log.ph}</Text>
                    <Text style={styles.label}>Calcium: {log.cal} ppm</Text>
                    <Text style={styles.label}>Magnesium: {log.mag} ppm</Text>
                    <Text style={styles.label}>Phosphate: {log.po4} ppm</Text>
                    <Text style={styles.label}>Nitrate: {log.no3} ppm</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedLog(log);
                          setEditModalVisible(true);
                        }}
                        style={[styles.deleteButton, { backgroundColor: "#3b82f6", marginRight: 8 }]}
                      >
                        <Text style={styles.deleteText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteLog(index)} style={styles.deleteButton}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
            )}

        </ScrollView>
        {editModalVisible && selectedLog && (
          <EditLogModal
            visible={editModalVisible}
            log={selectedLog}
            onClose={() => {
              setEditModalVisible(false);
              setSelectedLog(null);
            }}
            onSave={async (updatedLog) => {
              const updatedLogs = logs.map((log) =>
                log.date === updatedLog.date ? updatedLog : log
              );
              setLogs(updatedLogs);
              await AsyncStorage.setItem("reef_logs", JSON.stringify(updatedLogs));
              setEditModalVisible(false);
              setSelectedLog(null);
            }}
          />
        )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#000",
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0ff",
        marginBottom: 20,
    },
    homeButton: {
        backgroundColor: "#334155",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        alignSelf: "flex-start",
    },
    homeButtonText: {
        color: "#0ff",
        fontWeight: "bold",
        textAlign: "center",
    },
    empty: {
        color: "#888",
        fontStyle: "italic",
    },
    card: {
        backgroundColor: "#1e293b",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    date: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#fff",
        marginBottom: 8,
    },
    label: {
        color: "#ccc",
    },
    deleteButton: {
        marginTop: 12,
        backgroundColor: "#ff4d4d",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: "flex-end",
    },
    deleteText: {
        color: "#fff",
        fontWeight: "bold",
    },
});