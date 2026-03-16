import * as SQLite from 'expo-sqlite';

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
  return { ...plant, id: result.lastInsertRowId.toString() };
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
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  await db.runAsync(
    `UPDATE plants SET ${setClause} WHERE id = ?;`,
    [...values, id]
  );
};

export const deletePlant = async (id: string) => {
  await db.runAsync('DELETE FROM plants WHERE id = ?;', [id]);
};

export const getCareReminders = async () => {
  return await db.getAllAsync('SELECT * FROM care_reminders WHERE completed = 0;');
};

export const completeReminder = async (id: string) => {
  await db.runAsync('UPDATE care_reminders SET completed = 1 WHERE id = ?;', [id]);
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
