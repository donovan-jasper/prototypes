import * as SQLite from 'expo-sqlite';
import { encrypt, decrypt } from './encryption';

const db = SQLite.openDatabase('echovault.db');

const initializeCrisisMode = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS crisis_settings (id INTEGER PRIMARY KEY, pin TEXT, isEnabled INTEGER);',
          [],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

const generateCrisisPin = () => {
  // Generate a random 6-digit PIN
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const setCrisisPin = (pin) => {
  return new Promise((resolve, reject) => {
    const encryptedPin = encrypt(pin, 'crisis-pin-key');

    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO crisis_settings (id, pin, isEnabled) VALUES (1, ?, 1);',
          [encryptedPin],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

const getCrisisPin = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT pin FROM crisis_settings WHERE id = 1;',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              const encryptedPin = rows.item(0).pin;
              const pin = decrypt(encryptedPin, 'crisis-pin-key');
              resolve(pin);
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

const verifyCrisisPin = async (inputPin) => {
  try {
    const storedPin = await getCrisisPin();
    return storedPin === inputPin;
  } catch (error) {
    console.error('PIN verification error:', error);
    return false;
  }
};

const isCrisisModeEnabled = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT isEnabled FROM crisis_settings WHERE id = 1;',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0).isEnabled === 1);
            } else {
              resolve(false);
            }
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export {
  initializeCrisisMode,
  generateCrisisPin,
  setCrisisPin,
  getCrisisPin,
  verifyCrisisPin,
  isCrisisModeEnabled
};
