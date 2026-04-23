import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = SQLite.openDatabase('brainvault.db');

// Initialize database with encrypted schema
const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          type TEXT NOT NULL,
          channelId TEXT NOT NULL,
          metadata TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          isSynced INTEGER DEFAULT 0
        );`,
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

// Encrypt data before storage
const encryptData = async (data) => {
  const encryptionKey = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    'your-secret-key' // In production, use a proper key management system
  );
  return Crypto.encryptAsync(encryptionKey, JSON.stringify(data));
};

// Decrypt data after retrieval
const decryptData = async (encryptedData) => {
  const encryptionKey = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    'your-secret-key'
  );
  const decrypted = await Crypto.decryptAsync(encryptionKey, encryptedData);
  return JSON.parse(decrypted);
};

// Save item to SQLite with encryption
export const saveItem = async ({ content, type, channelId, metadata = {} }) => {
  await initDatabase();

  const itemId = Date.now().toString();
  const now = Date.now();

  const itemData = {
    id: itemId,
    content,
    type,
    channelId,
    metadata,
    createdAt: now,
    updatedAt: now
  };

  const encryptedContent = await encryptData(itemData);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO items (id, content, type, channelId, metadata, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          itemId,
          encryptedContent,
          type,
          channelId,
          JSON.stringify(metadata),
          now,
          now
        ],
        async (_, result) => {
          // Sync with Firebase
          try {
            const user = firebase.auth().currentUser;
            if (user) {
              await firebase.firestore().collection('users')
                .doc(user.uid)
                .collection('items')
                .doc(itemId)
                .set(itemData);

              // Mark as synced
              tx.executeSql(
                `UPDATE items SET isSynced = 1 WHERE id = ?;`,
                [itemId]
              );
            }
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Get all items with decryption
export const getItems = async () => {
  await initDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM items ORDER BY updatedAt DESC;`,
        [],
        async (_, { rows }) => {
          const items = [];
          for (let i = 0; i < rows.length; i++) {
            try {
              const decrypted = await decryptData(rows.item(i).content);
              items.push({
                ...decrypted,
                metadata: JSON.parse(rows.item(i).metadata)
              });
            } catch (error) {
              console.error('Decryption failed for item:', rows.item(i).id);
            }
          }
          resolve(items);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Sync local changes with Firebase
export const syncWithFirebase = async () => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const unsyncedItems = await new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM items WHERE isSynced = 0;`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });

  for (const item of unsyncedItems) {
    try {
      const decrypted = await decryptData(item.content);
      await firebase.firestore().collection('users')
        .doc(user.uid)
        .collection('items')
        .doc(item.id)
        .set(decrypted);

      db.transaction(tx => {
        tx.executeSql(
          `UPDATE items SET isSynced = 1 WHERE id = ?;`,
          [item.id]
        );
      });
    } catch (error) {
      console.error('Sync failed for item:', item.id, error);
    }
  }
};
