// Web storage utilities using localStorage instead of AsyncStorage

// Save any JSON-serializable value
export const saveData = (key: string, value: any): void => {
  try {
    const jsonValue = JSON.stringify(value);
    localStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

// Load a value by key
export const loadData = <T>(key: string): T | null => {
  try {
    const jsonValue = localStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Failed to load data", e);
    return null;
  }
};

// Delete a value by key
export const deleteData = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error("Failed to delete data", e);
  }
};
