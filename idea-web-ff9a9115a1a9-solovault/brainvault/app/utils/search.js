import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('brainvault.db');

export const searchItems = (query, channelFilter = 'all', contentTypeFilter = 'all') => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let sql = 'SELECT * FROM items WHERE text LIKE ?';
      const params = [`%${query}%`];

      if (channelFilter !== 'all') {
        sql += ' AND channel = ?';
        params.push(channelFilter);
      }

      if (contentTypeFilter !== 'all') {
        sql += ' AND contentType = ?';
        params.push(contentTypeFilter);
      }

      sql += ' ORDER BY createdAt DESC';

      tx.executeSql(
        sql,
        params,
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};
