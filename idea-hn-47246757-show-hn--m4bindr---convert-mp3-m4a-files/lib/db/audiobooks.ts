import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('chaptercast.db');

export const createAudiobook = async (audiobook) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO audiobooks (title, author, duration, filePath, coverArt, currentPosition) VALUES (?, ?, ?, ?, ?, ?)',
          [
            audiobook.title,
            audiobook.author,
            audiobook.duration,
            audiobook.filePath,
            audiobook.coverArt || null,
            audiobook.currentPosition || 0,
          ],
          (_, result) => {
            resolve({ id: result.insertId, ...audiobook });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
};

export const getAudiobooks = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM audiobooks ORDER BY createdAt DESC',
          [],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
};

export const getAudiobookById = async (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM audiobooks WHERE id = ?',
          [id],
          (_, { rows }) => {
            resolve(rows._array[0]);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
};

export const updateProgress = async (id, position) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE audiobooks SET currentPosition = ? WHERE id = ?',
          [position, id],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
};
