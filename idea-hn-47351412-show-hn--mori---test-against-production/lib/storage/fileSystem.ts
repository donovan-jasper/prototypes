import * as FileSystem from 'expo-file-system';

const saveSnapshotFile = async (data: any) => {
  const fileUri = `${FileSystem.documentDirectory}snapshot_${Date.now()}.db`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data));
  return fileUri;
};

export { saveSnapshotFile };
