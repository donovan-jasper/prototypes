import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('subsync.db');

const storeSubscriptions = (subscriptions) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY, name TEXT)');
      subscriptions.forEach((subscription) => {
        tx.executeSql('INSERT INTO subscriptions (id, name) VALUES (?, ?)', [subscription.id, subscription.name]);
      });
      resolve();
    }, (_, error) => {
      reject(error);
    });
  });
};

export { storeSubscriptions };
