import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('subsync.db');

const getSubscriptions = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM subscriptions', [], (_, results) => {
        const subscriptions = [];
        for (let i = 0; i < results.rows.length; i++) {
          subscriptions.push(results.rows.item(i));
        }
        resolve(subscriptions);
      }, (_, error) => {
        reject(error);
      });
    });
  });
};

const unsubscribe = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM subscriptions WHERE id = ?', [id], (_, results) => {
        resolve(results);
      }, (_, error) => {
        reject(error);
      });
    });
  });
};

export { getSubscriptions, unsubscribe };
