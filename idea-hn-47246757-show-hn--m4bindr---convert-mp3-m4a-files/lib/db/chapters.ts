import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('chaptercast.db');

export const createChapters = async (audiobookId, chapters) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        chapters.forEach((chapter, index) => {
          tx.executeSql(
            'INSERT INTO chapters (audiobookId, title, startTime, endTime, order) VALUES (?, ?, ?, ?, ?)',
            [
              audiobookId,
              chapter.title,
              chapter.startTime,
              chapter.endTime,
              index,
            ],
            (_, result) => {
              if (index === chapters.length - 1) {
                resolve(result);
              }
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      },
      (error) => reject(error)
    );
  });
};

export const getChaptersByAudiobookId = async (audiobookId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM chapters WHERE audiobookId = ? ORDER BY `order`',
          [audiobookId],
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

export const updateChapters = async (audiobookId, chapters) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // First delete all existing chapters for this audiobook
        tx.executeSql(
          'DELETE FROM chapters WHERE audiobookId = ?',
          [audiobookId],
          () => {
            // Then insert the new chapters
            chapters.forEach((chapter, index) => {
              tx.executeSql(
                'INSERT INTO chapters (audiobookId, title, startTime, endTime, order) VALUES (?, ?, ?, ?, ?)',
                [
                  audiobookId,
                  chapter.title,
                  chapter.startTime,
                  chapter.endTime,
                  index,
                ],
                (_, result) => {
                  if (index === chapters.length - 1) {
                    resolve(result);
                  }
                },
                (_, error) => {
                  reject(error);
                  return false;
                }
              );
            });
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
