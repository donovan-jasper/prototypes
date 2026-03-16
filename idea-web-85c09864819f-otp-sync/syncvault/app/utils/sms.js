import * as SQLite from 'expo-sqlite';
import { encrypt, decrypt } from './encryption';

const db = SQLite.openDatabase('syncvault.db');

export const getSMSS = async () => {
  // Fetch SMSs from the server or local storage
  // ...

  // Store the SMSs in the database
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT INTO smss (sender, body) VALUES (?, ?)',
      [sms.sender, sms.body],
      (_, result) => console.log('SMS stored successfully'),
      (_, error) => console.log('Error storing SMS:', error)
    );
  });

  return smss;
};
