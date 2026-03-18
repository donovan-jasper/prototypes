import db from './database';
import { FamilyMember } from '../types';

export const addFamilyMember = async (data: Omit<FamilyMember, 'id' | 'createdAt'>): Promise<FamilyMember> => {
  const result = await db.runAsync(
    'INSERT INTO family_members (name, birthdate, relationship, photo_uri, insurance_provider, insurance_id) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.birthdate, data.relationship, data.photoUri || null, data.insuranceProvider || null, data.insuranceId || null]
  );
  
  const member = await db.getFirstAsync<FamilyMember>(
    'SELECT * FROM family_members WHERE id = ?',
    [result.lastInsertRowId]
  );
  
  return member!;
};

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  return await db.getAllAsync<FamilyMember>('SELECT * FROM family_members ORDER BY created_at DESC');
};

export const getFamilyMember = async (id: number): Promise<FamilyMember | null> => {
  return await db.getFirstAsync<FamilyMember>('SELECT * FROM family_members WHERE id = ?', [id]);
};

export const updateFamilyMember = async (id: number, data: Partial<FamilyMember>): Promise<FamilyMember> => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  await db.runAsync(`UPDATE family_members SET ${fields} WHERE id = ?`, values);
  
  return (await getFamilyMember(id))!;
};

export const deleteFamilyMember = async (id: number): Promise<void> => {
  await db.runAsync('DELETE FROM family_members WHERE id = ?', [id]);
};
