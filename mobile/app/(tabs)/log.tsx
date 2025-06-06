// File: app/log.tsx

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Keyboard,
} from "react-native";
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

type FieldErrors = {
  [K in keyof ReefForm]?: string;
};

export default function LogScreen() {
  // Initialize form with today’s local date
  const todayDateObj = new Date();
  todayDateObj.setHours(0, 0, 0, 0);
  const year = todayDateObj.getFullYear();
  const month = (todayDateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = todayDateObj.getDate().toString().padStart(2, "0");
  const todayString = `${year}-${month}-${day}`;

  const [form, setForm] = useState<ReefForm>({
    date: todayString,
    temp: "",
    alk: "",
    ph: "",
    cal: "",
    mag: "",
    po4: "",
    no3: "",
    salinity: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  const router = useRouter();

  // Utility: Check if a string is a valid non-negative number
  const isNumber = (val: string) => {
    const n = parseFloat(val);
    return !isNaN(n) && isFinite(n) && n >= 0;
  };

  // Re-validate fields whenever form changes
  useEffect(() => {
    const newErrors: FieldErrors = {};

    // Validate date
    const dateVal = form.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      newErrors.date = "Use format YYYY-MM-DD";
    } else {
      const [y, m, d] = dateVal.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setHours(0, 0, 0, 0);
      if (isNaN(dt.getTime())) {
        newErrors.date = "Invalid date";
      } else if (dt.getTime() > todayDateObj.getTime()) {
        newErrors.date = "Date cannot be in the future";
      }
    }

    // Validate numeric fields only if non-empty
    (Object.keys(form) as (keyof ReefForm)[]).forEach((key) => {
      if (key !== "date") {
        const val = form[key];
        if (val.trim() !== "" && !isNumber(val)) {
          newErrors[key] = "Enter a valid number ≥ 0";
        }
      }
    });

    setErrors(newErrors);

    // Determine validity: date must be valid, plus no numeric-format errors
    const dateError = !!newErrors.date;
    const numericErrorExists = (Object.entries(newErrors) as [keyof ReefForm, string][]).some(
      ([k, msg]) => k !== "date" && !!msg
    );
    setIsValid(!dateError && !numericErrorExists);
  }, [form]);

  // Handle individual field updates
  const handleChange = (key: keyof ReefForm, value: string) => {
    if (key !== "date") {
      // For numeric fields, strip any non-numeric characters except dot
      const sanitized = value.replace(/[^0-9.]/g, "");
      setForm((prev) => ({ ...prev, [key]: sanitized }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Save log & update per-parameter history
  const saveLog = async () => {
    // Final validation: re-check date and numeric fields
    // (useEffect already did this, but we double-check here)
    const dateError = !!errors.date;
    const numErrorExists = (Object.entries(errors) as [keyof ReefForm, string][]).some(
      ([k, msg]) => k !== "date" && !!msg
    );
    if (dateError || numErrorExists) {
      Alert.alert("Fix errors", "Please correct the highlighted fields.");
      return;
    }

    try {
      const existing: string | null = await AsyncStorage.getItem("reef_logs");
      const logs: ReefForm[] = existing ? JSON.parse(existing) : [];

      // Overwrite any existing log with the same date
      const newLogs: ReefForm[] = [
        ...logs.filter((log) => log.date !== form.date),
        form,
      ];
      await AsyncStorage.setItem("reef_logs", JSON.stringify(newLogs));

      // ➤ Update per-parameter history
      const params: (keyof ReefForm)[] = [
        "alk",
        "cal",
        "mag",
        "ph",
        "po4",
        "no3",
        "salinity",
        "temp",
      ];
      for (const param of params) {
        const historyKey = `${param}History`;
        const existingHistory = await AsyncStorage.getItem(historyKey);
        const historyArray: { date: string; [key: string]: string }[] = existingHistory
          ? JSON.parse(existingHistory)
          : [];

        const filteredHistory = historyArray.filter((entry) => entry.date !== form.date);
        filteredHistory.push({ date: form.date, [param]: form[param] });
        await AsyncStorage.setItem(historyKey, JSON.stringify(filteredHistory));
      }

      console.log("Saved logs:", newLogs);
      Alert.alert("Saved!", "Your reef log was saved.");
      router.push({
        pathname: "/history",
        params: { refresh: Date.now().toString() },
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong saving your log.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Log Today's Parameters</Text>

      {[
        { label: "Date (YYYY-MM-DD)", key: "date" },
        { label: "Temperature (°C)", key: "temp" },
        { label: "Salinity (ppt)", key: "salinity" },
        { label: "Alkalinity (dKH)", key: "alk" },
        { label: "pH", key: "ph" },
        { label: "Calcium (ppm)", key: "cal" },
        { label: "Magnesium (ppm)", key: "mag" },
        { label: "Phosphate (ppm)", key: "po4" },
        { label: "Nitrate (ppm)", key: "no3" },
      ].map(({ label, key }) => (
        <View key={key} style={{ marginBottom: 16 }}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={[
              styles.input,
              errors[key as keyof ReefForm] ? styles.inputError : null,
            ]}
            keyboardType={key === "date" ? "default" : "numeric"}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={() => Keyboard.dismiss()}
            value={form[key as keyof ReefForm]}
            onChangeText={(text) => handleChange(key as keyof ReefForm, text)}
            placeholder={key === "date" ? "YYYY-MM-DD" : ""}
            placeholderTextColor="#888"
          />
          {errors[key as keyof ReefForm] ? (
            <Text style={styles.errorText}>
              {errors[key as keyof ReefForm]}
            </Text>
          ) : null}
        </View>
      ))}

      <TouchableOpacity
        onPress={saveLog}
        style={[styles.button, !isValid && styles.buttonDisabled]}
        disabled={!isValid}
      >
        <Text style={[styles.buttonText, !isValid && { opacity: 0.6 }]}>
          Save Log
        </Text>
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
  inputError: {
    borderWidth: 1,
    borderColor: "#f87171",
  },
  errorText: {
    color: "#f87171",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#0ff",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },
});