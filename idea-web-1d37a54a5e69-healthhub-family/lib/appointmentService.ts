import db from './database';
import { Appointment, Document } from '../types';
import { getDocumentsByAppointment } from './documentService';

export const addAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'completed'>): Promise<Appointment> => {
  const result = await db.runAsync(
    'INSERT INTO appointments (family_member_id, type, provider, date, location, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [data.familyMemberId, data.type, data.provider, data.date, data.location || null, data.notes || null]
  );

  return (await db.getFirstAsync<Appointment>('SELECT * FROM appointments WHERE id = ?', [result.lastInsertRowId]))!;
};

export const getAppointmentWithDocuments = async (id: number): Promise<(Appointment & { documents: Document[] }) | null> => {
  const appointment = await db.getFirstAsync<Appointment>('SELECT * FROM appointments WHERE id = ?', [id]);
  if (!appointment) return null;

  const documents = await getDocumentsByAppointment(id);

  return {
    ...appointment,
    documents: documents || []
  };
};

export const getAppointmentsByMember = async (familyMemberId: number): Promise<Appointment[]> => {
  return await db.getAllAsync<Appointment>(
    'SELECT * FROM appointments WHERE family_member_id = ? ORDER BY date DESC',
    [familyMemberId]
  );
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
  return await db.getAllAsync<Appointment>('SELECT * FROM appointments ORDER BY date DESC');
};

export const updateAppointment = async (id: number, data: Partial<Appointment>): Promise<Appointment> => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];

  await db.runAsync(`UPDATE appointments SET ${fields} WHERE id = ?`, values);

  return (await db.getFirstAsync<Appointment>('SELECT * FROM appointments WHERE id = ?', [id]))!;
};

export const deleteAppointment = async (id: number): Promise<void> => {
  await db.runAsync('DELETE FROM appointments WHERE id = ?', [id]);
};
