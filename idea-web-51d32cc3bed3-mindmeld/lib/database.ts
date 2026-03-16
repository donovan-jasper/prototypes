import * as SQLite from 'expo-sqlite';
import { Reminder, Habit } from '../types';

let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('flowstate.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      category TEXT,
      location TEXT
    );
    
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      streak INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      frequency TEXT
    );
  `);
};

export const getReminders = async (callback: (reminders: Reminder[]) => void) => {
  try {
    const result = await db.getAllAsync('SELECT * FROM reminders ORDER BY date DESC');
    const reminders = result.map((row: any) => ({
      ...row,
      completed: row.completed === 1,
    }));
    callback(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    callback([]);
  }
};

export const addReminder = async (reminder: Reminder) => {
  try {
    await db.runAsync(
      'INSERT INTO reminders (id, title, date, completed, category, location) VALUES (?, ?, ?, ?, ?, ?)',
      [reminder.id, reminder.title, reminder.date, reminder.completed ? 1 : 0, reminder.category || null, reminder.location || null]
    );
  } catch (error) {
    console.error('Error adding reminder:', error);
  }
};

export const toggleReminder = async (id: string) => {
  try {
    await db.runAsync(
      'UPDATE reminders SET completed = NOT completed WHERE id = ?',
      [id]
    );
  } catch (error) {
    console.error('Error toggling reminder:', error);
  }
};

export const getHabits = async (callback: (habits: Habit[]) => void) => {
  try {
    const result = await db.getAllAsync('SELECT * FROM habits');
    const habits = result.map((row: any) => ({
      ...row,
      completed: row.completed === 1,
    }));
    callback(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    callback([]);
  }
};

export const addHabit = async (habit: Habit) => {
  try {
    await db.runAsync(
      'INSERT INTO habits (id, title, streak, completed, frequency) VALUES (?, ?, ?, ?, ?)',
      [habit.id, habit.title, habit.streak, habit.completed ? 1 : 0, habit.frequency]
    );
  } catch (error) {
    console.error('Error adding habit:', error);
  }
};

export const toggleHabit = async (id: string) => {
  try {
    await db.runAsync(
      'UPDATE habits SET completed = NOT completed WHERE id = ?',
      [id]
    );
  } catch (error) {
    console.error('Error toggling habit:', error);
  }
};
