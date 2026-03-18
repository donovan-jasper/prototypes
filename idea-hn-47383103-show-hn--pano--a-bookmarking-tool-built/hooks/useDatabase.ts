import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { initDatabase } from '../lib/db/schema';
import { ShelfQueries, ItemQueries } from '../lib/db/queries';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let shelfQueriesInstance: ShelfQueries | null = null;
let itemQueriesInstance: ItemQueries | null = null;

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      if (!dbInstance) {
        dbInstance = await SQLite.openDatabaseAsync('shelflife.db');
        await initDatabase(dbInstance);
        shelfQueriesInstance = new ShelfQueries(dbInstance);
        itemQueriesInstance = new ItemQueries(dbInstance);
      }
      setIsReady(true);
    };

    setup();
  }, []);

  return {
    isReady,
    db: dbInstance,
    shelfQueries: shelfQueriesInstance,
    itemQueries: itemQueriesInstance,
  };
};
