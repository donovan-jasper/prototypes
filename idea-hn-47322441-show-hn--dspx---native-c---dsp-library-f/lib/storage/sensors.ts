import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('sensorsync.db');

export const getAllSensors = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM sensors',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getSensorById = async (sensorId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM sensors WHERE id = ?',
          [sensorId],
          (_, { rows }) => resolve(rows._array[0]),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};
