import { getDatabase } from './database';

export const upvoteIdea = (ideaId: number, userId: number) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Check if user already voted
      tx.executeSql(
        'SELECT * FROM votes WHERE ideaId = ? AND userId = ?',
        [ideaId, userId],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            const existingVote = _array[0];
            if (existingVote.voteType === 'upvote') {
              // Remove upvote
              tx.executeSql(
                'DELETE FROM votes WHERE ideaId = ? AND userId = ?',
                [ideaId, userId],
                () => {
                  tx.executeSql(
                    'UPDATE ideas SET upvotes = upvotes - 1 WHERE id = ?',
                    [ideaId],
                    (_, result) => resolve({ action: 'removed', result }),
                    (_, error) => reject(error)
                  );
                },
                (_, error) => reject(error)
              );
            } else {
              // Change downvote to upvote
              tx.executeSql(
                'UPDATE votes SET voteType = ? WHERE ideaId = ? AND userId = ?',
                ['upvote', ideaId, userId],
                () => {
                  tx.executeSql(
                    'UPDATE ideas SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = ?',
                    [ideaId],
                    (_, result) => resolve({ action: 'changed', result }),
                    (_, error) => reject(error)
                  );
                },
                (_, error) => reject(error)
              );
            }
          } else {
            // Add new upvote
            tx.executeSql(
              'INSERT INTO votes (ideaId, userId, voteType) VALUES (?, ?, ?)',
              [ideaId, userId, 'upvote'],
              () => {
                tx.executeSql(
                  'UPDATE ideas SET upvotes = upvotes + 1 WHERE id = ?',
                  [ideaId],
                  (_, result) => resolve({ action: 'added', result }),
                  (_, error) => reject(error)
                );
              },
              (_, error) => reject(error)
            );
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const downvoteIdea = (ideaId: number, userId: number) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Check if user already voted
      tx.executeSql(
        'SELECT * FROM votes WHERE ideaId = ? AND userId = ?',
        [ideaId, userId],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            const existingVote = _array[0];
            if (existingVote.voteType === 'downvote') {
              // Remove downvote
              tx.executeSql(
                'DELETE FROM votes WHERE ideaId = ? AND userId = ?',
                [ideaId, userId],
                () => {
                  tx.executeSql(
                    'UPDATE ideas SET downvotes = downvotes - 1 WHERE id = ?',
                    [ideaId],
                    (_, result) => resolve({ action: 'removed', result }),
                    (_, error) => reject(error)
                  );
                },
                (_, error) => reject(error)
              );
            } else {
              // Change upvote to downvote
              tx.executeSql(
                'UPDATE votes SET voteType = ? WHERE ideaId = ? AND userId = ?',
                ['downvote', ideaId, userId],
                () => {
                  tx.executeSql(
                    'UPDATE ideas SET downvotes = downvotes + 1, upvotes = upvotes - 1 WHERE id = ?',
                    [ideaId],
                    (_, result) => resolve({ action: 'changed', result }),
                    (_, error) => reject(error)
                  );
                },
                (_, error) => reject(error)
              );
            }
          } else {
            // Add new downvote
            tx.executeSql(
              'INSERT INTO votes (ideaId, userId, voteType) VALUES (?, ?, ?)',
              [ideaId, userId, 'downvote'],
              () => {
                tx.executeSql(
                  'UPDATE ideas SET downvotes = downvotes + 1 WHERE id = ?',
                  [ideaId],
                  (_, result) => resolve({ action: 'added', result }),
                  (_, error) => reject(error)
                );
              },
              (_, error) => reject(error)
            );
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getVoteCount = (ideaId: number) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT upvotes, downvotes FROM ideas WHERE id = ?',
        [ideaId],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            resolve(_array[0]);
          } else {
            resolve({ upvotes: 0, downvotes: 0 });
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getUserVote = (ideaId: number, userId: number) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT voteType FROM votes WHERE ideaId = ? AND userId = ?',
        [ideaId, userId],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            resolve(_array[0].voteType);
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};
