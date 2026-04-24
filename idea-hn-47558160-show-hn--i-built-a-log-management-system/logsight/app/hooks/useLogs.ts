import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('logsight.db');

const useLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, severity TEXT, message TEXT);'
      );
    });
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // First try to fetch from Firebase (mock implementation)
      const mockLogs = await fetchMockLogs();
      if (mockLogs.length > 0) {
        // Clear existing logs and insert new ones
        db.transaction(tx => {
          tx.executeSql('DELETE FROM logs');
          mockLogs.forEach(log => {
            tx.executeSql(
              'INSERT INTO logs (timestamp, severity, message) VALUES (?, ?, ?);',
              [log.timestamp, log.severity, log.message]
            );
          });
        });
      }

      // Then fetch from local DB
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM logs ORDER BY timestamp DESC;',
          [],
          (_, { rows: { _array } }) => {
            setLogs(_array);
            setIsLoading(false);
          },
          (_, error) => {
            console.log(error);
            setIsLoading(false);
          }
        );
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      setIsLoading(false);
    }
  };

  const addLog = (log) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO logs (timestamp, severity, message) VALUES (?, ?, ?);',
        [log.timestamp, log.severity, log.message],
        () => fetchLogs(),
        (_, error) => console.log(error)
      );
    });
  };

  return { logs, fetchLogs, addLog, isLoading };
};

// Mock function to simulate fetching from Firebase
const fetchMockLogs = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return mock log data
  return [
    {
      timestamp: new Date().toISOString(),
      severity: 'ERROR',
      message: 'Failed to connect to database'
    },
    {
      timestamp: new Date(Date.now() - 300000).toISOString(),
      severity: 'WARN',
      message: 'High memory usage detected'
    },
    {
      timestamp: new Date(Date.now() - 600000).toISOString(),
      severity: 'INFO',
      message: 'Application started successfully'
    }
  ];
};

export default useLogs;
