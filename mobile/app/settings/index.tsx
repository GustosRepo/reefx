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
import AdBanner from "../../components/AdBanner";
import ModeSwitch from "../../components/ModeSwitch";
import { useAquaMode, MODE_CONFIG } from "../../context/AquaModeContext";

// Reef-specific parameters
const reefParameters = [
  { key: "alk", label: "ALK (dKH)" },
  { key: "ph", label: "pH" },
  { key: "cal", label: "Calcium (ppm)" },
  { key: "mag", label: "Magnesium (ppm)" },
  { key: "po4", label: "Phosphate (PO₄)" },
  { key: "no3", label: "Nitrate (NO₃)" },
];

// Freshwater-specific parameters
const freshwaterParameters = [
  { key: "ph", label: "pH" },
  { key: "gh", label: "GH (dGH)" },
  { key: "kh", label: "KH (dKH)" },
  { key: "ammonia", label: "Ammonia (NH₃)" },
  { key: "nitrite", label: "Nitrite (NO₂)" },
  { key: "no3", label: "Nitrate (NO₃)" },
  { key: "co2", label: "CO₂ (ppm)" },
];

export default function SettingsScreen() {
  const [thresholds, setThresholds] = useState<Record<string, { min?: string; max?: string }>>({});
  const router = useRouter();
  const { mode, colors, modeLabel } = useAquaMode();
  
  // Get parameters based on current mode
  const parameters = mode === "reef" ? reefParameters : freshwaterParameters;

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <TouchableOpacity onPress={() => router.push("/")} style={[styles.backButton, { backgroundColor: colors.surface }]}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Home</Text>
        </TouchableOpacity>

        {/* Mode Selection Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🌊 Aquarium Mode</Text>
          <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
            Choose your aquarium type to see relevant parameters
          </Text>
          <View style={{ marginTop: 16 }}>
            <ModeSwitch variant="full" />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.primary }]}>⚙️ Alert Thresholds</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Set alert ranges for {modeLabel}. Leave blank to use defaults.
        </Text>

        {parameters.map(({ key, label }) => (
          <View key={key} style={styles.paramBox}>
            <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
            <View style={styles.thresholdRow}>
              <TextInput
                keyboardType="decimal-pad"
                value={thresholds[key]?.min || ""}
                onChangeText={(val) => handleChange(key, "min", val)}
                style={[styles.input, styles.inputHalf, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                placeholder="Min"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                keyboardType="decimal-pad"
                value={thresholds[key]?.max || ""}
                onChangeText={(val) => handleChange(key, "max", val)}
                style={[styles.input, styles.inputHalf, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                placeholder="Max"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.saveBtnText}>💾 Save Thresholds</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("https://code-wrx.com/privacy-policy")}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: colors.primary, textAlign: "center", textDecorationLine: "underline" }}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontWeight: "bold",
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 24,
  },
  paramBox: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: "bold",
  },
  thresholdRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    padding: 10,
    borderRadius: 8,
  },
  inputHalf: {
    flex: 1,
  },
  saveBtn: {
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});