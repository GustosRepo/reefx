import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

interface MaintenanceEntry {
  date: string;
  type: string;
  notes?: string;
  cost?: string;
  repeatInterval?: number;
  overdue?: boolean;
}

export default function MaintenancePage() {
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [repeatInterval, setRepeatInterval] = useState("");
  const [showAll, setShowAll] = useState(true);
  const router = useRouter();

  const refreshEntries = async () => {
    const stored = await AsyncStorage.getItem("reef_maintenance");
    if (stored) {
      const parsed: MaintenanceEntry[] = JSON.parse(stored);
      const today = new Date();
      const filtered = parsed.map((entry) => {
        const lastDate = new Date(entry.date);
        const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = entry.repeatInterval ? daysSince >= entry.repeatInterval : false;
        return { ...entry, overdue: isOverdue };
      });
      setEntries(filtered);
    }
  };

  useEffect(() => {
    refreshEntries();
  }, []);

  const saveEntry = async () => {
    if (!type.trim()) {
      Alert.alert("Required", "Please enter the maintenance type.");
      return;
    }

    const newEntry: MaintenanceEntry = {
      date: new Date().toISOString().split("T")[0],
      type,
      notes,
      cost,
      repeatInterval: repeatInterval ? parseInt(repeatInterval) : undefined,
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    await AsyncStorage.setItem("reef_maintenance", JSON.stringify(updated));
    setType("");
    setNotes("");
    setCost("");
    setRepeatInterval("");
    setModalVisible(false);
  };

  const handleDelete = (index: number) => {
    Alert.alert("Delete Entry", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = [...entries];
          updated.splice(index, 1);
          setEntries(updated);
          await AsyncStorage.setItem("reef_maintenance", JSON.stringify(updated));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace("/home")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Maintenance Tracker</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Maintenance</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addButton, { marginBottom: 10, backgroundColor: "#333" }]}
        onPress={() => setShowAll(!showAll)}
      >
        <Text style={{ color: "#0ff", fontWeight: "bold" }}>
          {showAll ? "🔒 Show Overdue Only" : "📜 Show All History"}
        </Text>
      </TouchableOpacity>

      {entries.length === 0 ? (
        <Text style={styles.empty}>No maintenance logged yet.</Text>
      ) : (
        <FlatList
          data={showAll ? entries : entries.filter((e) => e.overdue)}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.itemBox, item.overdue && styles.overdueBox]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.type}>{item.type}</Text>
                {item.notes ? <Text style={styles.notes}>📝 {item.notes}</Text> : null}
                {item.cost ? <Text style={styles.notes}>💸 {item.cost}</Text> : null}
                {item.repeatInterval ? (
                  <Text style={styles.notes}>
                    🔁 Every {item.repeatInterval} days
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => handleDelete(index)}>
                <Text style={styles.delete}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Maintenance</Text>
            <TextInput
              placeholder="Type (e.g. Water Change)"
              placeholderTextColor="#999"
              style={styles.input}
              value={type}
              onChangeText={setType}
            />
            <TextInput
              placeholder="Notes (optional)"
              placeholderTextColor="#999"
              style={styles.input}
              value={notes}
              onChangeText={setNotes}
            />
            <TextInput
              placeholder="Cost (optional)"
              placeholderTextColor="#999"
              style={styles.input}
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Repeat (days, optional)"
              placeholderTextColor="#999"
              style={styles.input}
              value={repeatInterval}
              onChangeText={setRepeatInterval}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={saveEntry} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
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
    textAlign: "center",
    marginBottom: 20,
  },
  empty: { color: "#ccc", textAlign: "center" },
  addButton: {
    backgroundColor: "#0ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: { color: "#000", fontWeight: "bold" },
  itemBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  overdueBox: {
    borderColor: "#f87171",
    borderWidth: 1,
  },
  date: { color: "#7df9ff", fontSize: 14 },
  type: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  notes: { color: "#ccc", fontSize: 14, marginTop: 4 },
  delete: { fontSize: 20, color: "#f87171", paddingLeft: 12 },
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
