import { getDatabase } from './database';

export const createFeedback = (feedback) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO feedback (ideaId, comment) VALUES (?, ?)',
        [feedback.ideaId, feedback.comment],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getFeedbackByIdeaId = (ideaId) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM feedback WHERE ideaId = ? ORDER BY createdAt DESC',
        [ideaId],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getFeedback = () => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT feedback.*, ideas.title as ideaTitle FROM feedback JOIN ideas ON feedback.ideaId = ideas.id ORDER BY feedback.createdAt DESC',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};
