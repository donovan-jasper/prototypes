import db from './db';

export const addContact = (name, phone, photo, isFavorite, isEmergency) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO contacts (name, phone, photo, isFavorite, isEmergency) VALUES (?, ?, ?, ?, ?);',
        [name, phone, photo, isFavorite ? 1 : 0, isEmergency ? 1 : 0],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getContacts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM contacts;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getFavorites = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM contacts WHERE isFavorite = 1;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getEmergencyContacts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM contacts WHERE isEmergency = 1;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateContact = (id, data) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE contacts SET name = ?, phone = ?, photo = ?, isFavorite = ?, isEmergency = ? WHERE id = ?;',
        [data.name, data.phone, data.photo, data.isFavorite ? 1 : 0, data.isEmergency ? 1 : 0, id],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteContact = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM contacts WHERE id = ?;',
        [id],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};
