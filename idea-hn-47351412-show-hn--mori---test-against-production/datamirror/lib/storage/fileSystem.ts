import * as FileSystem from 'expo-file-system';

const SNAPSHOT_DIR = `${FileSystem.documentDirectory}snapshots/`;

export async function saveSnapshotFile(db) {
  const filePath = `${SNAPSHOT_DIR}${Date.now()}.db`;
  await FileSystem.makeDirectoryAsync(SNAPSHOT_DIR, { intermediates: true });
  await FileSystem.copyAsync({ from: db._db._dbPath, to: filePath });
  return filePath;
}

export async function loadSnapshotFile(id) {
  const filePath = `${SNAPSHOT_DIR}${id}.db`;
  return filePath;
}

export async function deleteSnapshotFile(id) {
  const filePath = `${SNAPSHOT_DIR}${id}.db`;
  await FileSystem.deleteAsync(filePath);
}
