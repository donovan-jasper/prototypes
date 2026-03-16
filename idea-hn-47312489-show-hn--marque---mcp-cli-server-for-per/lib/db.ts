import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('designblend.db');

export const initDB = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS design_systems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        colors TEXT,
        typography TEXT,
        spacing TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS system_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        system_id INTEGER,
        image_uri TEXT,
        analysis TEXT,
        FOREIGN KEY (system_id) REFERENCES design_systems (id)
      );`
    );
  });
};

export const createSystem = (system, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO design_systems (name, colors, typography, spacing)
       VALUES (?, ?, ?, ?);`,
      [
        system.name,
        JSON.stringify(system.colors),
        JSON.stringify(system.typography),
        JSON.stringify(system.spacing),
      ],
      (_, result) => {
        if (callback) callback(result.insertId);
      }
    );
  });
};

export const getSystem = (id, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM design_systems WHERE id = ?;`,
      [id],
      (_, { rows }) => {
        if (callback) callback(rows._array[0]);
      }
    );
  });
};

export const updateSystem = (system, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE design_systems
       SET name = ?, colors = ?, typography = ?, spacing = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?;`,
      [
        system.name,
        JSON.stringify(system.colors),
        JSON.stringify(system.typography),
        JSON.stringify(system.spacing),
        system.id,
      ],
      (_, result) => {
        if (callback) callback(result.rowsAffected > 0);
      }
    );
  });
};

export const deleteSystem = (id, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `DELETE FROM design_systems WHERE id = ?;`,
      [id],
      (_, result) => {
        if (callback) callback(result.rowsAffected > 0);
      }
    );
  });
};

export const listSystems = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM design_systems ORDER BY updated_at DESC;`,
      [],
      (_, { rows }) => {
        if (callback) callback(rows._array);
      }
    );
  });
};
