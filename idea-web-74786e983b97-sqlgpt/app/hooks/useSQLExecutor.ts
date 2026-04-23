import React, { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

interface QueryResult {
  columns: string[];
  rows: any[][];
  error?: string;
}

const useSQLExecutor = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('querymentor.db');
        setDb(database);

        // Initialize with sample data if needed
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product TEXT,
            amount REAL,
            date TEXT
          );

          INSERT OR IGNORE INTO sales (product, amount, date)
          VALUES
            ('Widget A', 100.50, '2023-10-15'),
            ('Widget B', 75.25, '2023-10-16'),
            ('Widget C', 120.00, '2023-10-17');
        `);
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };

    initializeDB();
  }, []);

  const executeQuery = async (sql: string): Promise<QueryResult> => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await db.getAllAsync(sql);

      // Extract column names from the first row if available
      const columns = response.length > 0 ? Object.keys(response[0]) : [];

      // Convert rows to array of arrays for consistent display
      const rows = response.map(row => Object.values(row));

      const queryResult: QueryResult = {
        columns,
        rows,
      };

      setResult(queryResult);
      return queryResult;
    } catch (error) {
      const errorResult: QueryResult = {
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };

      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeQuery,
    result,
    isLoading,
  };
};

export default useSQLExecutor;
