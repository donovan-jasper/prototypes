import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('kinkeeper.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      frequency TEXT NOT NULL,
      importance INTEGER DEFAULT 5,
      notes TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      relationshipId INTEGER NOT NULL,
      type TEXT NOT NULL,
      notes TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (relationshipId) REFERENCES relationships(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS nudges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      relationshipId INTEGER NOT NULL,
      message TEXT NOT NULL,
      conversationStarter TEXT,
      scheduledFor TEXT NOT NULL,
      dismissed INTEGER DEFAULT 0,
      FOREIGN KEY (relationshipId) REFERENCES relationships(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_interactions_relationshipId ON interactions(relationshipId);
    CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON interactions(timestamp);
    CREATE INDEX IF NOT EXISTS idx_nudges_relationshipId ON nudges(relationshipId);
    CREATE INDEX IF NOT EXISTS idx_nudges_scheduledFor ON nudges(scheduledFor);
  `);
};

export const getDatabase = () => db;
