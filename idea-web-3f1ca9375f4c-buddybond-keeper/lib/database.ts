import * as SQLite from 'expo-sqlite';
import { Friend, Interaction, Reminder, HealthStatus } from './types';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('kinkeeper.db');

  await db.execAsync(
