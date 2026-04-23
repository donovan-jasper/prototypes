import db from './database';
import { Document } from '../types';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export const addDocument = async (familyMemberId: number, title: string, type: string, fileUri: string, appointmentId?: number): Promise<Document> => {
  const result = await db.runAsync(
    'INSERT INTO documents (family_member_id, title, type, file_uri, appointment_id) VALUES (?, ?, ?, ?, ?)',
    [familyMemberId, title, type, fileUri, appointmentId || null]
  );

  return (await db.getFirstAsync<Document>('SELECT * FROM documents WHERE id = ?', [result.lastInsertRowId]))!;
};

export const getDocumentsByMember = async (familyMemberId: number): Promise<Document[]> => {
  return await db.getAllAsync<Document>(
    'SELECT * FROM documents WHERE family_member_id = ? ORDER BY upload_date DESC',
    [familyMemberId]
  );
};

export const getDocumentsByAppointment = async (appointmentId: number): Promise<Document[]> => {
  return await db.getAllAsync<Document>(
    'SELECT * FROM documents WHERE appointment_id = ? ORDER BY upload_date DESC',
    [appointmentId]
  );
};

export const pickDocument = async (): Promise<DocumentPicker.DocumentPickerResult> => {
  return await DocumentPicker.getDocumentAsync({
    type: ['image/*', 'application/pdf'],
    copyToCacheDirectory: true,
  });
};

export const takePhoto = async (): Promise<ImagePicker.ImagePickerResult> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission not granted');
  }

  return await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });
};

export const deleteDocument = async (id: number): Promise<void> => {
  const doc = await db.getFirstAsync<Document>('SELECT * FROM documents WHERE id = ?', [id]);
  if (doc) {
    await FileSystem.deleteAsync(doc.fileUri, { idempotent: true });
    await db.runAsync('DELETE FROM documents WHERE id = ?', [id]);
  }
};

export const attachDocumentToAppointment = async (documentId: number, appointmentId: number): Promise<void> => {
  await db.runAsync(
    'UPDATE documents SET appointment_id = ? WHERE id = ?',
    [appointmentId, documentId]
  );
};
