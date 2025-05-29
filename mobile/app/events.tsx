import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function EventsPage() {
  const [events, setEvents] = useState<{ date: string; label: string }[]>([]);
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

  const handleDelete = (index: number) => {
    Alert.alert("Delete Event", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = [...events];
          updated.splice(index, 1);
          setEvents(updated);
          await AsyncStorage.setItem("reef_events", JSON.stringify(updated));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Logged Events</Text>
      {events.length > 0 && (
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Clear All Events", "Are you sure you want to delete all events?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Clear All",
                style: "destructive",
                onPress: async () => {
                  await AsyncStorage.removeItem("reef_events");
                  setEvents([]);
                },
              },
            ])
          }
          style={styles.clearAllButton}
        >
          <Text style={styles.clearAllText}>🧹 Clear All Events</Text>
        </TouchableOpacity>
      )}
      {events.length === 0 ? (
        <Text style={styles.noEvents}>No events logged yet.</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.eventRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.label}>{item.label}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(index)}>
                <Text style={styles.delete}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0ff",
    textAlign: "center",
    marginBottom: 20,
  },
  noEvents: {
    color: "#ccc",
    fontStyle: "italic",
    textAlign: "center",
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  date: {
    color: "#7df9ff",
    fontSize: 14,
  },
  label: {
    color: "#fff",
    fontSize: 16,
  },
  delete: {
    fontSize: 20,
    color: "#f87171",
    paddingLeft: 12,
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
  clearAllButton: {
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  clearAllText: {
    color: "#f87171",
    fontWeight: "bold",
  },
});