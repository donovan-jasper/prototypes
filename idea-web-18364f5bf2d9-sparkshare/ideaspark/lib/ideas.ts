import { getDatabase } from './database';

export const createIdea = (idea) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO ideas (title, description, category) VALUES (?, ?, ?)',
        [idea.title, idea.description, idea.category],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getIdeas = () => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM ideas ORDER BY createdAt DESC',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getIdeaById = (id) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM ideas WHERE id = ?',
        [id],
        (_, { rows: { _array } }) => resolve(_array[0]),
        (_, error) => reject(error)
      );
    });
  });
};
