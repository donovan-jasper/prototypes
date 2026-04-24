import { getDatabase } from './schema';
import { Audiobook, Chapter } from './schema';

const db = getDatabase();

export const createAudiobook = async (audiobook: Audiobook): Promise<Audiobook> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO audiobooks (title, author, duration, filePath, coverArt)
           VALUES (?, ?, ?, ?, ?);`,
          [audiobook.title, audiobook.author, audiobook.duration, audiobook.filePath, audiobook.coverArt || null],
          (_, result) => {
            const newAudiobookId = result.insertId;

            // Insert chapters if they exist
            if (audiobook.chapters && audiobook.chapters.length > 0) {
              const chapterValues = audiobook.chapters.map((chapter, index) => [
                newAudiobookId,
                chapter.title,
                chapter.startTime,
                chapter.endTime,
                index + 1
              ]);

              chapterValues.forEach((chapter) => {
                tx.executeSql(
                  `INSERT INTO chapters (audiobookId, title, startTime, endTime, "order")
                   VALUES (?, ?, ?, ?, ?);`,
                  chapter
                );
              });
            }

            resolve({ ...audiobook, id: newAudiobookId });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Transaction error:', error);
        reject(error);
      }
    );
  });
};

export const getAudiobooks = async (): Promise<Audiobook[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM audiobooks ORDER BY createdAt DESC;`,
          [],
          (_, { rows }) => {
            const audiobooks: Audiobook[] = rows._array;

            // Get chapters for each audiobook
            const audiobookPromises = audiobooks.map(audiobook => {
              return new Promise<Audiobook>((resolveAudiobook) => {
                tx.executeSql(
                  `SELECT * FROM chapters WHERE audiobookId = ? ORDER BY "order";`,
                  [audiobook.id],
                  (_, { rows: chapterRows }) => {
                    const chapters: Chapter[] = chapterRows._array;
                    resolveAudiobook({ ...audiobook, chapters });
                  },
                  (_, error) => {
                    console.error('Error fetching chapters:', error);
                    resolveAudiobook(audiobook);
                  }
                );
              });
            });

            Promise.all(audiobookPromises).then(resolvedAudiobooks => {
              resolve(resolvedAudiobooks);
            });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Transaction error:', error);
        reject(error);
      }
    );
  });
};

export const getAudiobookById = async (id: number): Promise<Audiobook | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM audiobooks WHERE id = ?;`,
          [id],
          (_, { rows }) => {
            if (rows.length === 0) {
              resolve(null);
              return;
            }

            const audiobook: Audiobook = rows.item(0);

            // Get chapters
            tx.executeSql(
              `SELECT * FROM chapters WHERE audiobookId = ? ORDER BY "order";`,
              [id],
              (_, { rows: chapterRows }) => {
                const chapters: Chapter[] = chapterRows._array;
                resolve({ ...audiobook, chapters });
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Transaction error:', error);
        reject(error);
      }
    );
  });
};

export const updateProgress = async (id: number, position: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE audiobooks SET currentPosition = ? WHERE id = ?;`,
          [position, id],
          () => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Transaction error:', error);
        reject(error);
      }
    );
  });
};

export const deleteAudiobook = async (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // First delete chapters
        tx.executeSql(
          `DELETE FROM chapters WHERE audiobookId = ?;`,
          [id],
          () => {
            // Then delete the audiobook
            tx.executeSql(
              `DELETE FROM audiobooks WHERE id = ?;`,
              [id],
              () => {
                resolve();
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Transaction error:', error);
        reject(error);
      }
    );
  });
};
