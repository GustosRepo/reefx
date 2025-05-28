// File: app/log.tsx

import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type ReefForm = {
    date: string;
    temp: string;
    alk: string;
    ph: string;
    cal: string;
    mag: string;
    po4: string;
    no3: string;
};

export default function LogScreen() {
    const [form, setForm] = useState<ReefForm>({
        date: new Date().toISOString().split("T")[0],
        temp: "",
        alk: "",
        ph: "",
        cal: "",
        mag: "",
        po4: "",
        no3: "",
    });

    const router = useRouter();

    const handleChange = (key: keyof ReefForm, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const saveLog = async () => {
        try {
            const existing: string | null = await AsyncStorage.getItem("reef_logs");
            const logs: ReefForm[] = existing ? JSON.parse(existing) : [];
            const newLogs: ReefForm[] = [...logs, form];
            await AsyncStorage.setItem("reef_logs", JSON.stringify(newLogs));
            Alert.alert("Saved!", "Your reef log was saved.");
            router.push("/history");
        } catch (err) {
            Alert.alert("Error", "Something went wrong saving your log.");
        }
    };

    const goHome = () => {
        router.push("/");
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 12, color: "#0ff" }}>
                Log Today's Parameters
            </Text>

            {[
                { label: "Date", key: "date" },
                { label: "Temperature (°C)", key: "temp" },
                { label: "Alkalinity (dKH)", key: "alk" },
                { label: "pH", key: "ph" },
                { label: "Calcium (ppm)", key: "cal" },
                { label: "Magnesium (ppm)", key: "mag" },
                { label: "Phosphate (ppm)", key: "po4" },
                { label: "Nitrate (ppm)", key: "no3" }
            ].map(({ label, key }) => (
                <View key={key} style={{ marginBottom: 16 }}>
                    <Text style={{ color: "#ccc", marginBottom: 4 }}>{label}</Text>
                    <TextInput
                        style={{ backgroundColor: "#1e293b", color: "white", padding: 12, borderRadius: 8 }}
                        keyboardType="numeric"
                        value={form[key as keyof ReefForm]}
                        onChangeText={(text) => handleChange(key as keyof ReefForm, text)}
                    />
                </View>
            ))}

            <TouchableOpacity
                onPress={saveLog}
                style={{ backgroundColor: "#0ff", padding: 16, borderRadius: 12, marginTop: 20 }}
            >
                <Text style={{ textAlign: "center", fontWeight: "bold" }}>Save Log</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={goHome}
                style={{ backgroundColor: "#334155", padding: 16, borderRadius: 12, marginTop: 12 }}
            >
                <Text style={{ textAlign: "center", fontWeight: "bold", color: "#0ff" }}>Go Back Home</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}