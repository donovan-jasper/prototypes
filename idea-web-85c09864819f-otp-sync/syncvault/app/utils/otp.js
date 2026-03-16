import * as SQLite from 'expo-sqlite';
import { encrypt, decrypt } from './encryption';

const db = SQLite.openDatabase('syncvault.db');

export const generateOTP = async (secret) => {
  // Generate OTP using the secret
  // ...

  // Store the secret in the database
  const encryptedSecret = encrypt(secret);
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT INTO otps (name, secret) VALUES (?, ?)',
      ['OTP', encryptedSecret],
      (_, result) => console.log('OTP stored successfully'),
      (_, error) => console.log('Error storing OTP:', error)
    );
  });

  return otp;
};

export const validateOTP = (secret, otp) => {
  // Validate the OTP using the secret
  // ...
};
