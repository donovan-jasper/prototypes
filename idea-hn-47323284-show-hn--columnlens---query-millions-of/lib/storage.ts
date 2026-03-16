import * as FileSystem from 'expo-file-system';

const STORAGE_DIR = FileSystem.documentDirectory + 'datadeck/';

export const initStorage = async () => {
  const dirInfo = await FileSystem.getInfoAsync(STORAGE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
  }
};

export const saveFile = async (uri: string, id: string) => {
  await initStorage();
  const destination = STORAGE_DIR + id + '.csv';
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
};

export const getFileMetadata = async (id: string) => {
  const path = STORAGE_DIR + id + '.csv';
  const info = await FileSystem.getInfoAsync(path);
  return info;
};

export const deleteFile = async (id: string) => {
  const path = STORAGE_DIR + id + '.csv';
  await FileSystem.deleteAsync(path, { idempotent: true });
};

export const getTotalStorageUsed = async () => {
  await initStorage();
  const files = await FileSystem.readDirectoryAsync(STORAGE_DIR);
  let total = 0;
  
  for (const file of files) {
    const info = await FileSystem.getInfoAsync(STORAGE_DIR + file);
    if (info.exists && !info.isDirectory) {
      total += info.size || 0;
    }
  }
  
  return total;
};
