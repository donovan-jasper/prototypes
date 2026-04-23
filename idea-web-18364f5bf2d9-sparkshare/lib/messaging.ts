import { getDatabase } from './database';
import { Message } from './types';

const db = getDatabase();

export const sendMessage = async (
  matchId: number,
  senderId: number,
  content: string
): Promise<Message> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO messages (match_id, sender_id, content, read_status)
         VALUES (?, ?, ?, ?)`,
        [matchId, senderId, content, 0],
        (_, { insertId }) => {
          tx.executeSql(
            `SELECT * FROM messages WHERE id = ?`,
            [insertId],
            (_, { rows: { _array: messages } }) => {
              if (messages.length > 0) {
                resolve(messages[0]);
              } else {
                reject(new Error('Failed to send message'));
              }
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getMessagesForMatch = async (matchId: number): Promise<Message[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM messages
         WHERE match_id = ?
         ORDER BY created_at ASC`,
        [matchId],
        (_, { rows: { _array: messages } }) => {
          resolve(messages);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const markMessagesAsRead = async (messageIds: number[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (messageIds.length === 0) {
      resolve();
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        `UPDATE messages
         SET read_status = 1
         WHERE id IN (${messageIds.map(() => '?').join(',')})`,
        messageIds,
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUnreadMessageCount = async (userId: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) as count
         FROM messages m
         JOIN matches ma ON m.match_id = ma.id
         WHERE (ma.user1_id = ? OR ma.user2_id = ?)
         AND m.sender_id != ?
         AND m.read_status = 0`,
        [userId, userId, userId],
        (_, { rows: { _array: result } }) => {
          resolve(result[0].count);
        },
        (_, error) => reject(error)
      );
    });
  });
};
