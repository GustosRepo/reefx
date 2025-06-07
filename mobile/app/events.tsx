import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function EventsPage() {
  const [events, setEvents] = useState<{ date: string; label: string }[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newDate, setNewDate] = useState("");

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchEvents = async () => {
        const stored = await AsyncStorage.getItem("reef_events");
        if (stored) setEvents(JSON.parse(stored));
        else setEvents([]);
      };
      fetchEvents();
    }, [])
  );

  const saveEvents = async (updated: { date: string; label: string }[]) => {
    setEvents(updated);
    await AsyncStorage.setItem("reef_events", JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!newDate || !newLabel) return;
    const updated = [...events, { date: newDate, label: newLabel }];
    saveEvents(updated);
    setNewDate("");
    setNewLabel("");
  };

  const handleDelete = (index: number) => {
    Alert.alert("Delete Event", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updated = events.filter((_, i) => i !== index);
          saveEvents(updated);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => router.push("/home")} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Logged Events</Text>
            <View style={{ flex: 1 }}>
              <FlatList
                data={events}
                ListEmptyComponent={<Text style={styles.empty}>No events logged yet.</Text>}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.eventItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventText}>
                        {item.date} — {item.label}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(index)}>
                      <Text style={styles.deleteIcon}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          </View>

          <View style={styles.form}>
            <TextInput
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#888"
              value={newDate}
              onChangeText={setNewDate}
              style={styles.input}
            />
            <TextInput
              placeholder="Event description"
              placeholderTextColor="#888"
              value={newLabel}
              onChangeText={setNewLabel}
              style={styles.input}
            />
            <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
              <Text style={styles.addText}>+ Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", padding: 20 },
  content: { flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: "#00f2ff", marginBottom: 10 },
  empty: { color: "#888", fontStyle: "italic" },
  eventItem: {
    backgroundColor: "#111",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  eventText: {
    color: "#eee",
    fontSize: 16,
  },
  deleteIcon: {
    color: "#f87171",
    fontSize: 18,
    paddingLeft: 10,
  },
  backBtn: {
    backgroundColor: "#222",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backText: { color: "#ccc" },
  form: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 20,
  },
  input: {
    backgroundColor: "#111",
    color: "white",
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
    borderRadius: 6,
  },
  addBtn: {
    backgroundColor: "#00f2ff",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 5,
  },
  addText: {
    color: "black",
    fontWeight: "bold",
  },
});