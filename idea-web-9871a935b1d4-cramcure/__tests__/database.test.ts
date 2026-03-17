import { initDatabase, addSymptom, getSymptomsByDateRange, addCycle, getCycles, addReliefSession, getReliefSessions } from '../services/database';
import * as SQLite from 'expo-sqlite';

describe('Database Service', () => {
  let db: SQLite.SQLiteDatabase;

  beforeAll(async () => {
    db = await initDatabase();
  });

  afterEach(async () => {
    await db.execAsync('DELETE FROM symptoms');
    await db.execAsync('DELETE FROM cycles');
    await db.execAsync('DELETE FROM relief_sessions');
  });

  test('creates tables successfully', async () => {
    const result = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    const tableNames = result.map(row => row.name);
    expect(tableNames).toContain('cycles');
    expect(tableNames).toContain('symptoms');
    expect(tableNames).toContain('relief_sessions');
  });

  test('adds and retrieves symptoms', async () => {
    const symptom = {
      date: new Date().toISOString(),
      painLevel: 7,
      location: 'lower abdomen',
      type: 'cramping',
    };
    
    const id = await addSymptom(db, symptom);
    expect(id).toBeGreaterThan(0);
    
    const symptoms = await getSymptomsByDateRange(
      db,
      new Date(Date.now() - 86400000),
      new Date()
    );
    
    expect(symptoms.length).toBeGreaterThan(0);
    expect(symptoms[0].painLevel).toBe(7);
    expect(symptoms[0].location).toBe('lower abdomen');
  });

  test('tracks cycle data', async () => {
    const cycle = {
      startDate: new Date().toISOString(),
      predictedNextStart: new Date(Date.now() + 28 * 86400000).toISOString(),
    };
    
    const id = await addCycle(db, cycle);
    expect(id).toBeGreaterThan(0);
    
    const cycles = await getCycles(db);
    expect(cycles.length).toBeGreaterThan(0);
    expect(cycles[0].startDate).toBe(cycle.startDate);
  });

  test('adds and retrieves relief sessions', async () => {
    const session = {
      exerciseId: 'breathing-1',
      date: new Date().toISOString(),
      beforePain: 8,
      afterPain: 4,
      duration: 300,
    };
    
    const id = await addReliefSession(db, session);
    expect(id).toBeGreaterThan(0);
    
    const sessions = await getReliefSessions(db);
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].exerciseId).toBe('breathing-1');
    expect(sessions[0].beforePain).toBe(8);
    expect(sessions[0].afterPain).toBe(4);
  });

  test('retrieves symptoms by date range', async () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
    
    await addSymptom(db, { date: twoDaysAgo.toISOString(), painLevel: 5 });
    await addSymptom(db, { date: yesterday.toISOString(), painLevel: 7 });
    await addSymptom(db, { date: today.toISOString(), painLevel: 6 });
    
    const symptoms = await getSymptomsByDateRange(db, yesterday, today);
    expect(symptoms.length).toBe(2);
  });

  test('limits cycle retrieval', async () => {
    await addCycle(db, { startDate: new Date(Date.now() - 60 * 86400000).toISOString() });
    await addCycle(db, { startDate: new Date(Date.now() - 30 * 86400000).toISOString() });
    await addCycle(db, { startDate: new Date().toISOString() });
    
    const cycles = await getCycles(db, 2);
    expect(cycles.length).toBe(2);
  });

  test('handles missing optional fields', async () => {
    const symptom = {
      date: new Date().toISOString(),
      painLevel: 5,
    };
    
    const id = await addSymptom(db, symptom);
    expect(id).toBeGreaterThan(0);
    
    const symptoms = await getSymptomsByDateRange(
      db,
      new Date(Date.now() - 86400000),
      new Date()
    );
    
    expect(symptoms[0].location).toBeNull();
    expect(symptoms[0].type).toBeNull();
  });
});
