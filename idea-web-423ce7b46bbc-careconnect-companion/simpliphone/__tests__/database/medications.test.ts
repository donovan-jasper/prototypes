import * as SQLite from 'expo-sqlite';
import { addMedication, getMedications, getMedicationById, logAdherence, getAdherenceReport } from '../../database/medications';

jest.mock('expo-sqlite');

describe('medications database', () => {
  let db;

  beforeEach(() => {
    db = SQLite.openDatabase('simpliphone.db');
    db.transaction = jest.fn((callback) => callback({
      executeSql: jest.fn((sql, params, success, error) => {
        if (sql.includes('INSERT')) {
          success(null, { insertId: 1 });
        } else if (sql.includes('SELECT')) {
          success(null, { rows: { _array: [{ id: 1, name: 'Aspirin', dosage: '1 tablet', schedule: '08:00', photo: null }] } });
        }
      }),
    }));
  });

  it('adds a medication correctly', async () => {
    const result = await addMedication('Aspirin', '1 tablet', '08:00', null);
    expect(result).toBe(1);
  });

  it('gets all medications correctly', async () => {
    const result = await getMedications();
    expect(result).toEqual([{ id: 1, name: 'Aspirin', dosage: '1 tablet', schedule: '08:00', photo: null }]);
  });

  it('gets a medication by ID correctly', async () => {
    const result = await getMedicationById(1);
    expect(result).toEqual({ id: 1, name: 'Aspirin', dosage: '1 tablet', schedule: '08:00', photo: null });
  });

  it('logs adherence correctly', async () => {
    const result = await logAdherence(1, 'taken', new Date().toISOString());
    expect(result).toBe(1);
  });

  it('gets adherence report correctly', async () => {
    const result = await getAdherenceReport(1, new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]);
    expect(result).toEqual([{ id: 1, medicationId: 1, status: 'taken', timestamp: expect.any(String) }]);
  });
});
