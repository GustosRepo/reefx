import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

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
};

export default function HistoryScreen() {
    const [logs, setLogs] = useState<ReefForm[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchLogs = async () => {
            const stored = await AsyncStorage.getItem("reef_logs");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) setLogs(parsed);
                } catch (err) {
                    console.error("Failed to parse logs:", err);
                }
            }
        };
        fetchLogs();
    }, []);

    const goHome = () => {
        router.push("/");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Past Reef Logs</Text>


            {logs.length === 0 ? (
                <Text style={styles.empty}>No logs found.</Text>
            ) : (
                logs.map((log, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.date}>{log.date}</Text>
                        <Text style={styles.label}>Temperature: {log.temp} °C</Text>
                        <Text style={styles.label}>ALK: {log.alk} dKH</Text>
                        <Text style={styles.label}>pH: {log.ph}</Text>
                        <Text style={styles.label}>Calcium: {log.cal} ppm</Text>
                        <Text style={styles.label}>Magnesium: {log.mag} ppm</Text>
                        <Text style={styles.label}>Phosphate: {log.po4} ppm</Text>
                        <Text style={styles.label}>Nitrate: {log.no3} ppm</Text>
                    </View>
                ))
            )}
            <TouchableOpacity
                onPress={goHome}
                style={{ backgroundColor: "#334155", padding: 16, borderRadius: 12, marginTop: 12 }}
            >
                <Text style={{ textAlign: "center", fontWeight: "bold", color: "#0ff" }}>Go Back Home</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
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
});