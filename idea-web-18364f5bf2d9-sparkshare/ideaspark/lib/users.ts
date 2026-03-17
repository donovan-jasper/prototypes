import { getDatabase } from './database';

export const getUserProfile = () => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM users WHERE id = 1',
        [],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            resolve(_array[0]);
          } else {
            resolve({
              id: 1,
              name: 'Demo User',
              email: 'demo@ideaspark.com',
              sparkScore: 0,
              bio: 'Welcome to IdeaSpark!'
            });
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};
