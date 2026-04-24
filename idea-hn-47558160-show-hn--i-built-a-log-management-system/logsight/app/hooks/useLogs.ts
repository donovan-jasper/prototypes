import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const localDb = SQLite.openDatabase('logsight.db');

const useLogs = (queryParams = {}) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize local database
  useEffect(() => {
    localDb.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, severity TEXT, message TEXT, statusCode INTEGER, service TEXT);'
      );
    });
  }, []);

  // Set up Firestore real-time listener
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Build Firestore query based on params
    let firestoreQuery = query(
      collection(db, 'logs'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    if (queryParams.severity) {
      firestoreQuery = query(firestoreQuery, where('severity', '==', queryParams.severity));
    }

    if (queryParams.statusCode) {
      firestoreQuery = query(firestoreQuery, where('statusCode', '==', queryParams.statusCode));
    }

    if (queryParams.service) {
      firestoreQuery = query(firestoreQuery, where('service', '==', queryParams.service));
    }

    if (queryParams.keyword) {
      // For keyword search, we'll filter locally after fetching
    }

    const unsubscribe = onSnapshot(firestoreQuery, (querySnapshot) => {
      const newLogs = [];
      querySnapshot.forEach((doc) => {
        newLogs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Filter by keyword if provided
      const filteredLogs = queryParams.keyword
        ? newLogs.filter(log =>
            log.message.toLowerCase().includes(queryParams.keyword.toLowerCase()) ||
            (log.service && log.service.toLowerCase().includes(queryParams.keyword.toLowerCase()))
          )
        : newLogs;

      // Store in local database
      localDb.transaction(tx => {
        tx.executeSql('DELETE FROM logs');
        filteredLogs.forEach(log => {
          tx.executeSql(
            'INSERT INTO logs (timestamp, severity, message, statusCode, service) VALUES (?, ?, ?, ?, ?);',
            [log.timestamp, log.severity, log.message, log.statusCode || null, log.service || null]
          );
        });
      });

      setLogs(filteredLogs);
      setIsLoading(false);
    }, (err) => {
      console.error('Firestore error:', err);
      setError(err.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [queryParams]);

  const fetchLocalLogs = () => {
    setIsLoading(true);
    localDb.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM logs ORDER BY timestamp DESC;',
        [],
        (_, { rows: { _array } }) => {
          setLogs(_array);
          setIsLoading(false);
        },
        (_, error) => {
          console.log(error);
          setError(error.message);
          setIsLoading(false);
        }
      );
    });
  };

  const addLog = (log) => {
    localDb.transaction(tx => {
      tx.executeSql(
        'INSERT INTO logs (timestamp, severity, message, statusCode, service) VALUES (?, ?, ?, ?, ?);',
        [log.timestamp, log.severity, log.message, log.statusCode || null, log.service || null],
        () => fetchLocalLogs(),
        (_, error) => {
          console.log(error);
          setError(error.message);
        }
      );
    });
  };

  return { logs, isLoading, error, addLog, fetchLocalLogs };
};

export default useLogs;
