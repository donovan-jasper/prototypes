import * as SQLite from 'expo-sqlite';
import { Restaurant, UserList, Inspection } from '@/types';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('safebite.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        safetyScore INTEGER NOT NULL,
        lastInspectionDate TEXT NOT NULL,
        violationCount INTEGER NOT NULL,
        cuisine TEXT NOT NULL,
        cachedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inspections (
        id TEXT PRIMARY KEY,
        restaurantId TEXT NOT NULL,
        date TEXT NOT NULL,
        score INTEGER NOT NULL,
        violations TEXT NOT NULL,
        FOREIGN KEY (restaurantId) REFERENCES restaurants(id)
      );

      CREATE TABLE IF NOT EXISTS user_lists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        restaurantIds TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_restaurants_cached ON restaurants(cachedAt);
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const cacheRestaurant = async (restaurant: Restaurant): Promise<void> => {
  if (!db) await initDatabase();
  
  const cachedAt = new Date().toISOString();
  await db!.runAsync(
    `INSERT OR REPLACE INTO restaurants 
     (id, name, address, latitude, longitude, safetyScore, lastInspectionDate, violationCount, cuisine, cachedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      restaurant.id,
      restaurant.name,
      restaurant.address,
      restaurant.latitude,
      restaurant.longitude,
      restaurant.safetyScore,
      restaurant.lastInspectionDate,
      restaurant.violationCount,
      restaurant.cuisine,
      cachedAt,
    ]
  );
};

export const getCachedRestaurants = async (limit: number = 50): Promise<Restaurant[]> => {
  if (!db) await initDatabase();
  
  const result = await db!.getAllAsync<Restaurant & { cachedAt: string }>(
    'SELECT * FROM restaurants ORDER BY cachedAt DESC LIMIT ?',
    [limit]
  );
  
  return result.map(({ cachedAt, ...rest }) => rest);
};

export const getCachedRestaurantById = async (id: string): Promise<Restaurant | null> => {
  if (!db) await initDatabase();
  
  const result = await db!.getFirstAsync<Restaurant & { cachedAt: string }>(
    'SELECT * FROM restaurants WHERE id = ?',
    [id]
  );
  
  if (!result) return null;
  
  const { cachedAt, ...restaurant } = result;
  return restaurant;
};

export const clearOldCache = async (daysOld: number = 7): Promise<void> => {
  if (!db) await initDatabase();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  await db!.runAsync(
    'DELETE FROM restaurants WHERE cachedAt < ?',
    [cutoffDate.toISOString()]
  );
};

export const saveUserList = async (list: UserList): Promise<void> => {
  if (!db) await initDatabase();
  
  await db!.runAsync(
    `INSERT OR REPLACE INTO user_lists (id, name, restaurantIds, createdAt)
     VALUES (?, ?, ?, ?)`,
    [list.id, list.name, JSON.stringify(list.restaurantIds), list.createdAt]
  );
};

export const getUserLists = async (): Promise<UserList[]> => {
  if (!db) await initDatabase();
  
  const result = await db!.getAllAsync<Omit<UserList, 'restaurantIds'> & { restaurantIds: string }>(
    'SELECT * FROM user_lists ORDER BY createdAt DESC'
  );
  
  return result.map(list => ({
    ...list,
    restaurantIds: JSON.parse(list.restaurantIds),
  }));
};

export const deleteUserList = async (id: string): Promise<void> => {
  if (!db) await initDatabase();
  
  await db!.runAsync('DELETE FROM user_lists WHERE id = ?', [id]);
};

export const cacheInspection = async (inspection: Inspection): Promise<void> => {
  if (!db) await initDatabase();
  
  await db!.runAsync(
    `INSERT OR REPLACE INTO inspections (id, restaurantId, date, score, violations)
     VALUES (?, ?, ?, ?, ?)`,
    [
      inspection.id,
      inspection.restaurantId,
      inspection.date,
      inspection.score,
      JSON.stringify(inspection.violations),
    ]
  );
};

export const getCachedInspections = async (restaurantId: string): Promise<Inspection[]> => {
  if (!db) await initDatabase();
  
  const result = await db!.getAllAsync<Omit<Inspection, 'violations'> & { violations: string }>(
    'SELECT * FROM inspections WHERE restaurantId = ? ORDER BY date DESC',
    [restaurantId]
  );
  
  return result.map(inspection => ({
    ...inspection,
    violations: JSON.parse(inspection.violations),
  }));
};
