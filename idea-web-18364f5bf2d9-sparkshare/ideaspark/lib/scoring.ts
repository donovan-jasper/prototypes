import { getDatabase } from './database';

export const calculateSparkScore = (userId) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT COUNT(*) as ideaCount FROM ideas WHERE userId = ?',
        [userId],
        (_, { rows: { _array } }) => {
          const ideaCount = _array[0].ideaCount;
          tx.executeSql(
            'SELECT COUNT(*) as feedbackCount FROM feedback WHERE userId = ?',
            [userId],
            (_, { rows: { _array } }) => {
              const feedbackCount = _array[0].feedbackCount;
              const score = ideaCount * 10 + feedbackCount * 5;
              resolve(score);
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const updateSparkScore = (userId, score) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE users SET sparkScore = ? WHERE id = ?',
        [score, userId],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
