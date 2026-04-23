import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';

let db = null;

const initDatabase = async () => {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('librio.db');

  await db.execAsync(
