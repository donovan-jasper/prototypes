import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('rules.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS rules (id TEXT PRIMARY KEY, name TEXT, pattern TEXT);',
      [],
      () => console.log('Database initialized'),
      (_, error) => console.log(error)
    );
  });
};

export const saveRule = (rule) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO rules (id, name, pattern) VALUES (?, ?, ?);',
      [Date.now().toString(), rule.name, rule.pattern],
      () => console.log('Rule saved'),
      (_, error) => console.log(error)
    );
  });
};

export const getRules = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM rules;',
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => console.log(error)
    );
  });
};
