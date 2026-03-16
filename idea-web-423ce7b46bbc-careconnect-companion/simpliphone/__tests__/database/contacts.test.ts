import * as SQLite from 'expo-sqlite';
import { addContact, getContacts, getFavorites, getEmergencyContacts, updateContact, deleteContact } from '../../database/contacts';

jest.mock('expo-sqlite');

describe('contacts database', () => {
  let db;

  beforeEach(() => {
    db = SQLite.openDatabase('simpliphone.db');
    db.transaction = jest.fn((callback) => callback({
      executeSql: jest.fn((sql, params, success, error) => {
        if (sql.includes('INSERT')) {
          success(null, { insertId: 1 });
        } else if (sql.includes('SELECT')) {
          success(null, { rows: { _array: [{ id: 1, name: 'John Doe', phone: '1234567890', photo: null, isFavorite: true, isEmergency: false }] } });
        } else if (sql.includes('UPDATE')) {
          success(null, { rowsAffected: 1 });
        } else if (sql.includes('DELETE')) {
          success(null, { rowsAffected: 1 });
        }
      }),
    }));
  });

  it('adds a contact correctly', async () => {
    const result = await addContact('John Doe', '1234567890', null, true, false);
    expect(result).toBe(1);
  });

  it('gets all contacts correctly', async () => {
    const result = await getContacts();
    expect(result).toEqual([{ id: 1, name: 'John Doe', phone: '1234567890', photo: null, isFavorite: true, isEmergency: false }]);
  });

  it('gets favorite contacts correctly', async () => {
    const result = await getFavorites();
    expect(result).toEqual([{ id: 1, name: 'John Doe', phone: '1234567890', photo: null, isFavorite: true, isEmergency: false }]);
  });

  it('gets emergency contacts correctly', async () => {
    const result = await getEmergencyContacts();
    expect(result).toEqual([{ id: 1, name: 'John Doe', phone: '1234567890', photo: null, isFavorite: true, isEmergency: false }]);
  });

  it('updates a contact correctly', async () => {
    const result = await updateContact(1, { name: 'Jane Doe', phone: '0987654321', photo: null, isFavorite: false, isEmergency: true });
    expect(result).toBe(1);
  });

  it('deletes a contact correctly', async () => {
    const result = await deleteContact(1);
    expect(result).toBe(1);
  });
});
