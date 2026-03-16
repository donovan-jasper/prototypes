import db from './db';

export const addMedication = (name, dosage, schedule, photo) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO medications (name, dosage, schedule, photo) VALUES (?, ?, ?, ?);',
        [name, dosage, schedule, photo],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getMedications = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM medications;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getMedicationById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM medications WHERE id = ?;',
        [id],
        (_, { rows: { _array } }) => resolve(_array[0]),
        (_, error) => reject(error)
      );
    });
  });
};

export const logAdherence = (medicationId, status, timestamp) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO adherence_log (medicationId, status, timestamp) VALUES (?, ?, ?);',
        [medicationId, status, timestamp],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAdherenceReport = (medicationId, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM adherence_log WHERE medicationId = ? AND timestamp BETWEEN ? AND ?;',
        [medicationId, startDate, endDate],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};
