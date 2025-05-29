import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LivestockTracker() {
  const [entries, setEntries] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("All");
  const [species, setSpecies] = useState("");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [filterType, setFilterType] = useState("All");

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const raw = await AsyncStorage.getItem("reef_livestock");
      if (raw) setEntries(JSON.parse(raw));
    };
    loadData();
  }, []);

  const handleAdd = async () => {
    if (!name.trim() || !species.trim()) {
      Alert.alert("Missing info", "Name and species are required.");
      return;
    }

    if (editingEntry) {
      const updated = entries.map((e) =>
        e.id === editingEntry.id
          ? { ...e, name, species, notes, type, price }
          : e
      );
      setEntries(updated);
      await AsyncStorage.setItem("reef_livestock", JSON.stringify(updated));
      setEditingEntry(null);
    } else {
      const newEntry = {
        id: Date.now(),
        name,
        type,
        species,
        date: new Date().toISOString().split("T")[0],
        notes,
        price,
      };
      const updated = [...entries, newEntry];
      setEntries(updated);
      await AsyncStorage.setItem("reef_livestock", JSON.stringify(updated));
    }

    setName("");
    setSpecies("");
    setNotes("");
    setPrice("");
  };

  const handleDelete = async (id: number) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    await AsyncStorage.setItem("reef_livestock", JSON.stringify(updated));
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => router.replace("/")}
        style={{
          alignSelf: "flex-start",
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: "#1e293b",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "#7df9ff", fontWeight: "bold" }}>← Back Home</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Livestock & Coral Tracker</Text>

      <View style={styles.formBox}>
        <TextInput
          placeholder="Name / Nickname"
          placeholderTextColor="#999"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Species"
          placeholderTextColor="#999"
          style={styles.input}
          value={species}
          onChangeText={setSpecies}
        />

        <View style={styles.typeSelector}>
          {["Coral", "Fish", "Invertebrate"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              style={[
                styles.typeButton,
                type === t && styles.typeButtonActive
              ]}
            >
              <Text style={styles.typeButtonText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder="Notes (optional)"
          placeholderTextColor="#999"
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
        />

        <TextInput
          placeholder="Price (optional)"
          placeholderTextColor="#999"
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>
            {editingEntry ? "Save Changes" : "+ Add"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterBox}>
        <View style={styles.typeSelector}>
          {["All", "Coral", "Fish", "Invertebrate"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setFilterType(t)}
              style={[
                styles.typeButton,
                filterType === t && styles.typeButtonActive
              ]}
            >
              <Text style={styles.typeButtonText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder="Search by name, species, or notes"
          placeholderTextColor="#999"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {entries
        .filter((entry) => {
          const query = search.toLowerCase();
          const matchesSearch =
            entry.name.toLowerCase().includes(query) ||
            entry.species.toLowerCase().includes(query) ||
            entry.notes?.toLowerCase().includes(query);

          const matchesType = filterType === "All" || entry.type === filterType;

          return matchesSearch && matchesType;
        })
        .map((entry) => (
          <View key={entry.id} style={styles.entryBox}>
            <Text style={styles.entryText}>
              {entry.name} ({entry.type}) - {entry.species}
            </Text>
            <Text style={styles.entrySub}>Added: {entry.date}</Text>
            {entry.notes ? <Text style={styles.entrySub}>{entry.notes}</Text> : null}
            {entry.price ? <Text style={styles.entrySub}>Price: ${entry.price}</Text> : null}
            <TouchableOpacity
              onPress={() => handleDelete(entry.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditingEntry(entry);
                setName(entry.name);
                setSpecies(entry.species);
                setNotes(entry.notes || "");
                setPrice(entry.price || "");
                setType(entry.type);
              }}
              style={{ marginTop: 4 }}
            >
              <Text style={{ color: "#0ff", fontSize: 13 }}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0ff",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  picker: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#0ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  entryBox: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: "#333",
    borderWidth: 1,
  },
  entryText: {
    color: "#7df9ff",
    fontSize: 16,
    fontWeight: "600",
  },
  entrySub: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 2,
  },
  deleteButton: {
    marginTop: 6,
    alignSelf: "flex-start",
  },
  deleteButtonText: {
    color: "#f66",
    fontSize: 13,
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  typeButton: {
    backgroundColor: "#1e1e1e",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    marginBottom: 6,
  },
  typeButtonActive: {
    backgroundColor: "#0ff",
  },
  typeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  filterBox: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 32,
    borderColor: "#333",
    borderWidth: 1,
  },
  formBox: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
});