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

          CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            join_date TEXT
          );

          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            order_date TEXT,
            total REAL,
            FOREIGN KEY(customer_id) REFERENCES customers(id)
          );

          INSERT OR IGNORE INTO sales (product, amount, date)
          VALUES
            ('Widget A', 100.50, '2023-10-15'),
            ('Widget B', 75.25, '2023-10-16'),
            ('Widget C', 120.00, '2023-10-17');

          INSERT OR IGNORE INTO customers (name, email, join_date)
          VALUES
            ('John Doe', 'john@example.com', '2023-01-15'),
            ('Jane Smith', 'jane@example.com', '2023-02-20');

          INSERT OR IGNORE INTO orders (customer_id, order_date, total)
          VALUES
            (1, '2023-10-01', 150.00),
            (2, '2023-10-05', 200.00);
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
