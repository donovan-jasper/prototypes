import * as SQLite from 'expo-sqlite';
import { Habit, Completion } from './types';

const db = SQLite.openDatabase('streakstack.db');

export async function getHabitCompletions(habitId: string): Promise<Completion[]> {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT c.*, h.name as habitName
         FROM completions c
         JOIN habits h ON c.habit_id = h.id
         WHERE c.habit_id = ?
         ORDER BY c.date DESC`,
        [habitId],
        (_, { rows }) => {
          const completions: Completion[] = [];
          for (let i = 0; i < rows.length; i++) {
            completions.push(rows.item(i));
          }
          resolve(completions);
        },
        (_, error) => {
          console.error('Error fetching habit completions:', error);
          resolve([]);
        }
      );
    });
  });
}

export async function getHabitById(habitId: string): Promise<Habit | null> {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM habits WHERE id = ?',
        [habitId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error fetching habit:', error);
          resolve(null);
        }
      );
    });
  });
}

export async function createHabit(habitData: {
  userId: string;
  name: string;
  frequency: string;
  reminderTime: string;
}): Promise<Habit> {
  const habitId = Date.now().toString();

  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO habits (id, user_id, name, frequency, reminder_time) VALUES (?, ?, ?, ?, ?)',
        [habitId, habitData.userId, habitData.name, habitData.frequency, habitData.reminderTime],
        () => {
          resolve({
            id: habitId,
            userId: habitData.userId,
            name: habitData.name,
            frequency: habitData.frequency,
            reminderTime: habitData.reminderTime,
            createdAt: new Date().toISOString()
          });
        },
        (_, error) => {
          console.error('Error creating habit:', error);
          resolve(null);
        }
      );
    });
  });
}

export async function updateHabitCompletion(habitId: string, date: string, completed: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    db.transaction(tx => {
      // Check if completion already exists
      tx.executeSql(
        'SELECT * FROM completions WHERE habit_id = ? AND date = ?',
        [habitId, date],
        (_, { rows }) => {
          if (rows.length > 0) {
            // Update existing completion
            tx.executeSql(
              'UPDATE completions SET completed = ? WHERE habit_id = ? AND date = ?',
              [completed, habitId, date],
              () => resolve(true),
              (_, error) => {
                console.error('Error updating completion:', error);
                resolve(false);
              }
            );
          } else {
            // Insert new completion
            tx.executeSql(
              'INSERT INTO completions (habit_id, date, completed) VALUES (?, ?, ?)',
              [habitId, date, completed],
              () => resolve(true),
              (_, error) => {
                console.error('Error creating completion:', error);
                resolve(false);
              }
            );
          }
        },
        (_, error) => {
          console.error('Error checking completion:', error);
          resolve(false);
        }
      );
    });
  });
}
