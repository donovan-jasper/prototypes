import * as SQLite from 'expo-sqlite';

export const initializeDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('audiochain.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      brand TEXT NOT NULL,
      price REAL NOT NULL,
      specs_json TEXT NOT NULL,
      upc TEXT
    );
    
    CREATE TABLE IF NOT EXISTS builds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS build_components (
      build_id INTEGER NOT NULL,
      component_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (build_id, component_id),
      FOREIGN KEY (build_id) REFERENCES builds(id),
      FOREIGN KEY (component_id) REFERENCES components(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_components_type ON components(type);
    CREATE INDEX IF NOT EXISTS idx_components_brand ON components(brand);
  `);
};
