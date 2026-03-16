import * as FileSystem from 'expo-file-system';

const CACHE_DIR = `${FileSystem.cacheDirectory}codelens/`;

export const initCache = async () => {
  await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
};

export const saveToCache = async (fileHash, data) => {
  const fileUri = `${CACHE_DIR}${fileHash}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data));
};

export const getFromCache = async (fileHash) => {
  const fileUri = `${CACHE_DIR}${fileHash}.json`;
  try {
    const data = await FileSystem.readAsStringAsync(fileUri);
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

export const clearCache = async () => {
  await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
  await initCache();
};
