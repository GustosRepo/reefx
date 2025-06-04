import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native";
import type { ReefForm } from "../app/(tabs)/history";
import { useEffect } from "react";

type Props = {
  visible: boolean;
  log: ReefForm | null;
  onSave: (updatedLog: ReefForm) => void;
  onClose: () => void;
};

export default function EditLogModal({ visible, log, onSave, onClose }: Props) {
  const [editedLog, setEditedLog] = useState<ReefForm | null>(log);

  useEffect(() => {
    setEditedLog(log); // Update modal state when log changes
  }, [log]);

  const handleChange = (field: keyof ReefForm, value: string) => {
    if (editedLog && log) {
      setEditedLog({
        ...editedLog,
        [field]: value,
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Edit Log</Text>
            {editedLog &&
              ["date", "temp", "salinity", "alk", "ph", "cal", "mag", "po4", "no3"].map((field) => (
                <View key={`edit-field-${field}`}>
                  <Text style={styles.label}>{field.toUpperCase()}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={field}
                    value={editedLog[field as keyof ReefForm]?.toString()}
                    onChangeText={(text) => handleChange(field as keyof ReefForm, text)}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>
              ))}
            <View style={styles.row}>
              <TouchableOpacity onPress={() => log && editedLog && onSave({ ...log, ...editedLog })} style={styles.save}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.cancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", backgroundColor: "#0009" },
  modal: { backgroundColor: "#1e293b", margin: 20, borderRadius: 12, padding: 16 },
  title: { color: "#0ff", fontWeight: "bold", fontSize: 18, marginBottom: 10 },
  label: { color: "#7dd3fc", fontWeight: "600", marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: "#0f172a", color: "#fff", marginBottom: 10, padding: 10, borderRadius: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  save: { backgroundColor: "#3b82f6", padding: 10, borderRadius: 8 },
  saveText: { color: "#fff" },
  cancel: { backgroundColor: "#64748b", padding: 10, borderRadius: 8 },
  cancelText: { color: "#fff" },
});
