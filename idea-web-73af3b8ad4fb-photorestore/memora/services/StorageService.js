import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@memora_restorations';

export const saveRestoration = async (restoration) => {
  try {
    const existing = await getRestorations();
    const updated = [restoration, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving restoration:', error);
    return false;
  }
};

export const getRestorations = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting restorations:', error);
    return [];
  }
};

export const deleteRestoration = async (id) => {
  try {
    const existing = await getRestorations();
    const updated = existing.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error deleting restoration:', error);
    return false;
  }
};
