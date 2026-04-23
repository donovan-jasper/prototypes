import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Photo } from '../types';

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [4, 3],
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
}

export async function savePhoto(
  db: SQLite.SQLiteDatabase,
  plantId: number,
  uri: string
): Promise<number> {
  const filename = `${Date.now()}.jpg`;
  const directory = `${FileSystem.documentDirectory}photos/`;

  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const newUri = `${directory}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: newUri });

  const result = await db.runAsync(
    `INSERT INTO photos (plant_id, uri, taken_at) VALUES (?, ?, ?)`,
    [plantId, newUri, new Date().toISOString()]
  );

  return result.lastInsertRowId;
}

export async function getPhotosForPlant(
  db: SQLite.SQLiteDatabase,
  plantId: number
): Promise<Photo[]> {
  return await db.getAllAsync<Photo>(
    'SELECT * FROM photos WHERE plant_id = ? ORDER BY taken_at DESC',
    [plantId]
  );
}

export async function getPhotoById(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<Photo | null> {
  const result = await db.getFirstAsync<Photo>(
    'SELECT * FROM photos WHERE id = ?',
    [id]
  );
  return result || null;
}

export async function deletePhoto(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<void> {
  // First get the photo to delete the file
  const photo = await getPhotoById(db, id);
  if (photo && photo.uri) {
    await FileSystem.deleteAsync(photo.uri, { idempotent: true });
  }

  // Then delete from database
  await db.runAsync('DELETE FROM photos WHERE id = ?', [id]);
}
