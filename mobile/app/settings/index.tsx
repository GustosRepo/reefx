import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const parameters = [
  { key: "alk", label: "ALK (dKH)" },
  { key: "ph", label: "pH" },
  { key: "cal", label: "Calcium (ppm)" },
  { key: "mag", label: "Magnesium (ppm)" },
  { key: "po4", label: "Phosphate (PO₄)" },
  { key: "no3", label: "Nitrate (NO₃)" },
];

export default function SettingsScreen() {
  const [thresholds, setThresholds] = useState<Record<string, { min?: string; max?: string }>>({});
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem("reef_thresholds");
      if (stored) setThresholds(JSON.parse(stored));
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem("reef_thresholds", JSON.stringify(thresholds));
      Alert.alert("✅ Saved!", "Your alert thresholds were updated.");
    } catch (err) {
      console.error("Failed to save thresholds", err);
    }
  };

  const handleChange = (param: string, type: "min" | "max", value: string) => {
    setThresholds((prev) => ({
      ...prev,
      [param]: {
        ...prev[param],
        [type]: value,
      },
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>⚙️ Alert Thresholds</Text>
      <Text style={styles.description}>
        Set how much change should trigger an alert for each parameter. Leave blank to use defaults.
      </Text>

      {parameters.map(({ key, label }) => (
        <View key={key} style={styles.paramBox}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.thresholdRow}>
            <TextInput
              keyboardType="decimal-pad"
              value={thresholds[key]?.min || ""}
              onChangeText={(val) => handleChange(key, "min", val)}
              style={[styles.input, styles.inputHalf]}
              placeholder="Min"
              placeholderTextColor="#888"
            />
            <TextInput
              keyboardType="decimal-pad"
              value={thresholds[key]?.max || ""}
              onChangeText={(val) => handleChange(key, "max", val)}
              style={[styles.input, styles.inputHalf]}
              placeholder="Max"
              placeholderTextColor="#888"
            />
          </View>
        </View>
      ))}

      <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>💾 Save Thresholds</Text>
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
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    marginBottom: 16,
  },
  backButtonText: {
    color: "#7df9ff",
    fontWeight: "bold",
  },
  title: {
    color: "#0ff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    color: "#ccc",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 24,
  },
  paramBox: {
    marginBottom: 16,
  },
  label: {
    color: "#7df9ff",
    marginBottom: 4,
    fontWeight: "bold",
  },
  thresholdRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  inputHalf: {
    flex: 1,
  },
  saveBtn: {
    backgroundColor: "#0ff",
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  saveBtnText: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
});