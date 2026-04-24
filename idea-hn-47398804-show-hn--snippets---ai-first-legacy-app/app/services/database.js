import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('echovault.db');

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, date TEXT, audioUri TEXT);',
          [],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

const addNote = (title, content, audioUri) => {
  return new Promise((resolve, reject) => {
    const date = new Date().toISOString();
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO notes (title, content, date, audioUri) VALUES (?, ?, ?, ?);',
          [title, content, date, audioUri],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

const getNotes = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM notes ORDER BY date DESC;',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

const updateNote = (id, title, content) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE notes SET title = ?, content = ? WHERE id = ?;',
          [title, content, id],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

const deleteNote = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM notes WHERE id = ?;',
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export { initializeDatabase, addNote, getNotes, updateNote, deleteNote };
