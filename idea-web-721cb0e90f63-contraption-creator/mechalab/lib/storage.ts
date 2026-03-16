import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('mechalab.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS contraptions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, parts TEXT, thumbnail TEXT, createdAt TEXT);'
    );
  });
};

export const saveContraption = (contraption) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO contraptions (name, parts, thumbnail, createdAt) VALUES (?, ?, ?, ?);',
          [
            contraption.name,
            JSON.stringify(contraption.parts),
            contraption.thumbnail,
            new Date().toISOString(),
          ],
          (_, { insertId }) => resolve(insertId),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const loadContraption = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM contraptions WHERE id = ?;',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const contraption = rows.item(0);
              contraption.parts = JSON.parse(contraption.parts);
              resolve(contraption);
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

export const listContraptions = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM contraptions ORDER BY createdAt DESC;',
          [],
          (_, { rows }) => {
            const contraptions = [];
            for (let i = 0; i < rows.length; i++) {
              const contraption = rows.item(i);
              contraption.parts = JSON.parse(contraption.parts);
              contraptions.push(contraption);
            }
            resolve(contraptions);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const deleteContraption = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM contraptions WHERE id = ?;',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};
