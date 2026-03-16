import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('pairpurse.db');

export const openDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, amount REAL, category TEXT, paidBy TEXT, splitWith TEXT, date TEXT);',
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const addExpense = async (expense) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO expenses (description, amount, category, paidBy, splitWith, date) VALUES (?, ?, ?, ?, ?, ?);',
        [expense.description, expense.amount, expense.category, expense.paidBy, JSON.stringify(expense.splitWith), expense.date],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getExpenses = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM expenses ORDER BY date DESC;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getBalance = async (user1, user2) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT SUM(amount) AS total FROM expenses WHERE paidBy = ?;',
        [user1],
        (_, { rows: { _array } }) => {
          const totalPaidByUser1 = _array[0].total || 0;
          tx.executeSql(
            'SELECT SUM(amount) AS total FROM expenses WHERE paidBy = ?;',
            [user2],
            (_, { rows: { _array } }) => {
              const totalPaidByUser2 = _array[0].total || 0;
              resolve(totalPaidByUser1 - totalPaidByUser2);
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};
