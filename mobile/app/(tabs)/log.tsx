// File: app/log.tsx

import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, Keyboard } from "react-native";
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
    salinity: string;
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
        salinity: "",

    });

    const router = useRouter();

    const handleChange = (key: keyof ReefForm, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const saveLog = async () => {
        try {
            const existing: string | null = await AsyncStorage.getItem("reef_logs");
            const logs: ReefForm[] = existing ? JSON.parse(existing) : [];
            const newLogs: ReefForm[] = [...logs.filter(log => log.date !== form.date), form];
            await AsyncStorage.setItem("reef_logs", JSON.stringify(newLogs));
            console.log("Saved logs:", newLogs);
            Alert.alert("Saved!", "Your reef log was saved.");
            router.push({ pathname: "/history", params: { refresh: Date.now().toString() } });        } catch (err) {
            Alert.alert("Error", "Something went wrong saving your log.");
        }
    };

    const goHome = () => {
        router.push("/(tabs)/home");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>
                Log Today's Parameters
            </Text>

            {[
                { label: "Date", key: "date" },
                { label: "Temperature (°C)", key: "temp" },
                { label: "Salinity (ppt)", key: "salinity" },
                { label: "Alkalinity (dKH)", key: "alk" },
                { label: "pH", key: "ph" },
                { label: "Calcium (ppm)", key: "cal" },
                { label: "Magnesium (ppm)", key: "mag" },
                { label: "Phosphate (ppm)", key: "po4" },
                { label: "Nitrate (ppm)", key: "no3" }
            ].map(({ label, key }) => (
                <View key={key} style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>{label}</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        onSubmitEditing={() => Keyboard.dismiss()}
                        value={form[key as keyof ReefForm]}
                        onChangeText={(text) => handleChange(key as keyof ReefForm, text)}
                    />
                </View>
            ))}

            <TouchableOpacity
                onPress={saveLog}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Save Log</Text>
            </TouchableOpacity>

        </ScrollView>
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
    marginBottom: 12,
    color: "#0ff",
  },
  label: {
    color: "#ccc",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 12,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#0ff",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
});