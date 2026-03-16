import * as SQLite from 'expo-sqlite';
import gearDatabase from '@/assets/gear-database.json';

export const seedDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('audiochain.db');
  
  for (const component of gearDatabase) {
    await db.runAsync(
      'INSERT INTO components (name, type, brand, price, specs_json, upc) VALUES (?, ?, ?, ?, ?, ?)',
      [
        component.name,
        component.type,
        component.brand,
        component.price,
        JSON.stringify(component.specs),
        component.upc || null,
      ]
    );
  }
};
