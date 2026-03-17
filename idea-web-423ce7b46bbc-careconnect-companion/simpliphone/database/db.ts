import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = SQLite.openDatabase('simpliphone.db');

export const initDB = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            photo TEXT,
            isFavorite BOOLEAN NOT NULL DEFAULT 0,
            isEmergency BOOLEAN NOT NULL DEFAULT 0
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dosage TEXT NOT NULL,
            schedule TEXT NOT NULL,
            photo TEXT
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            theme TEXT NOT NULL DEFAULT 'light',
            textSize INTEGER NOT NULL DEFAULT 16
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS adherence_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medicationId INTEGER NOT NULL,
            status TEXT NOT NULL,
            timestamp DATETIME NOT NULL,
            FOREIGN KEY (medicationId) REFERENCES medications (id)
          );`
        );
      },
      error => {
        console.error('Database initialization error:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

// AsyncStorage fallback functions for critical data
export const saveEmergencyContactsFallback = async (contacts: any[]) => {
  try {
    await AsyncStorage.setItem('emergency_contacts', JSON.stringify(contacts));
  } catch (error) {
    console.error('Failed to save emergency contacts to AsyncStorage:', error);
  }
};

export const getEmergencyContactsFallback = async () => {
  try {
    const data = await AsyncStorage.getItem('emergency_contacts');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get emergency contacts from AsyncStorage:', error);
    return [];
  }
};

export default db;
