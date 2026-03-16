import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'finsight.db', createFromLocation: '~finsight.db' });

export const saveTransactions = (transactions) => {
  db.transaction(tx => {
    tx.executeSql('INSERT INTO transactions (amount) VALUES (?)', [transactions.amount]);
  });
};

export const getTransactions = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM transactions', [], (tx, results) => {
        const transactions = [];
        for (let i = 0; i < results.rows.length; i++) {
          transactions.push(results.rows.item(i));
        }
        resolve(transactions);
      }, (error) => {
        reject(error);
      });
    });
  });
};
