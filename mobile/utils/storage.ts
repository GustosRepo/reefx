import AsyncStorage from "@react-native-async-storage/async-storage";

// Save any JSON-serializable value
export const saveData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

// Load a value by key
export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Failed to load data", e);
    return null;
  }
};

// Delete a value by key
export const deleteData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("Failed to delete data", e);
  }
};