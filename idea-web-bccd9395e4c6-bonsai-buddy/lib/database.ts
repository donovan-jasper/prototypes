import * as SQLite from 'expo-sqlite';
import { getNextWateringDate } from './notifications';

let db: SQLite.SQLiteDatabase;

export const openDatabase = async () => {
  db = await SQLite.openDatabaseAsync('plantpulse.db');
  await initDatabase();
};

export const initDatabase = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      wateringFrequency INTEGER NOT NULL,
      lastWatered TEXT,
      lastFertilized TEXT,
      photoUris TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL
    );
  `);
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS care_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plantId INTEGER NOT NULL,
      type TEXT NOT NULL,
      scheduledFor TEXT NOT NULL,
      completed INTEGER NOT NULL,
      FOREIGN KEY(plantId) REFERENCES plants(id)
    );
  `);
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plantId INTEGER NOT NULL,
      uri TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(plantId) REFERENCES plants(id)
    );
  `);
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      premiumStatus INTEGER NOT NULL,
      notificationPreferences TEXT,
      theme TEXT
    );
  `);
};

export const addPlant = async (plant: any) => {
  const result = await db.runAsync(
    `INSERT INTO plants (name, species, wateringFrequency, lastWatered, lastFertilized, photoUris, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [plant.name, plant.species, plant.wateringFrequency, plant.lastWatered || null, plant.lastFertilized || null, JSON.stringify(plant.photoUris || []), plant.notes || null, new Date().toISOString()]
  );
  
  const plantId = result.lastInsertRowId.toString();
  
  // Create initial care reminder
  const nextWateringDate = getNextWateringDate(
    plant.lastWatered || new Date().toISOString(), 
    plant.wateringFrequency
  );
  
  await db.runAsync(
    `INSERT INTO care_reminders (plantId, type, scheduledFor, completed)
     VALUES (?, ?, ?, ?);`,
    [plantId, 'water', nextWateringDate.toISOString(), 0]
  );
  
  return { ...plant, id: plantId };
};

export const getPlants = async () => {
  const result = await db.getAllAsync('SELECT * FROM plants;');
  return result.map((plant: any) => ({
    ...plant,
    photoUris: JSON.parse(plant.photoUris || '[]')
  }));
};

export const updatePlant = async (id: string, data: any) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  // Handle photoUris specially
  const processedData = { ...data };
  if ('photoUris' in data) {
    if (typeof data.photoUris === 'string') {
      // Already stringified, use as-is
      processedData.photoUris = data.photoUris;
    } else if (Array.isArray(data.photoUris)) {
      // Array, stringify it
      processedData.photoUris = JSON.stringify(data.photoUris);
    }
  }
  
  const processedKeys = Object.keys(processedData);
  const processedValues = Object.values(processedData);
  const setClause = processedKeys.map(key => `${key} = ?`).join(', ');
  
  await db.runAsync(
    `UPDATE plants SET ${setClause} WHERE id = ?;`,
    [...processedValues, id]
  );
  
  // If lastWatered was updated, create a new reminder
  if (data.lastWatered) {
    const plant = await db.getFirstAsync('SELECT * FROM plants WHERE id = ?;', [id]) as any;
    if (plant) {
      const nextWateringDate = getNextWateringDate(
        data.lastWatered, 
        plant.wateringFrequency
      );
      
      await db.runAsync(
        `INSERT INTO care_reminders (plantId, type, scheduledFor, completed)
         VALUES (?, ?, ?, ?);`,
        [id, 'water', nextWateringDate.toISOString(), 0]
      );
    }
  }
};

export const deletePlant = async (id: string) => {
  await db.runAsync('DELETE FROM plants WHERE id = ?;', [id]);
  await db.runAsync('DELETE FROM care_reminders WHERE plantId = ?;', [id]);
};

export const getCareReminders = async () => {
  return await db.getAllAsync('SELECT * FROM care_reminders WHERE completed = 0;');
};

export const completeReminder = async (id: string) => {
  // Get the reminder details
  const reminder = await db.getFirstAsync('SELECT * FROM care_reminders WHERE id = ?;', [id]) as any;
  
  if (reminder) {
    // Mark reminder as completed
    await db.runAsync('UPDATE care_reminders SET completed = 1 WHERE id = ?;', [id]);
    
    // Update plant's lastWatered field
    const now = new Date().toISOString();
    await db.runAsync('UPDATE plants SET lastWatered = ? WHERE id = ?;', [now, reminder.plantId]);
    
    // Get plant's watering frequency
    const plant = await db.getFirstAsync('SELECT * FROM plants WHERE id = ?;', [reminder.plantId]) as any;
    
    if (plant) {
      // Create new reminder for next watering
      const nextWateringDate = getNextWateringDate(now, plant.wateringFrequency);
      
      await db.runAsync(
        `INSERT INTO care_reminders (plantId, type, scheduledFor, completed)
         VALUES (?, ?, ?, ?);`,
        [reminder.plantId, 'water', nextWateringDate.toISOString(), 0]
      );
    }
  }
};

export const snoozeReminder = async (id: string, hours: number) => {
  const newDate = new Date();
  newDate.setHours(newDate.getHours() + hours);
  await db.runAsync('UPDATE care_reminders SET scheduledFor = ? WHERE id = ?;', [newDate.toISOString(), id]);
};

export const getStreak = async () => {
  const result = await db.getFirstAsync('SELECT COUNT(*) as streak FROM care_reminders WHERE completed = 1;');
  return (result as any)?.streak || 0;
};

export const updateStreak = async (newStreak: number) => {
  return newStreak;
};
