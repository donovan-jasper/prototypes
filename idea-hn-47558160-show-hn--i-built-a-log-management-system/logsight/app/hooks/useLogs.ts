import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('logsight.db');

const useLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, severity TEXT, message TEXT);'
      );
    });
  }, []);

  const fetchLogs = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM logs;',
        [],
        (_, { rows: { _array } }) => setLogs(_array),
        (_, error) => console.log(error)
      );
    });
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

  return { logs, fetchLogs, addLog };
};

export default useLogs;
