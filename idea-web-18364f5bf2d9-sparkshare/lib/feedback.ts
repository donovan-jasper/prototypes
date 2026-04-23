import { getDatabase } from './database';
import { FeedbackNotification } from './types';

export const getFeedbackNotifications = async (userId: number): Promise<FeedbackNotification[]> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT f.id, f.idea_id, f.user_id as commenter_id, u.username as commenter_username,
                f.content as comment_text, f.created_at, fn.unread, i.title as idea_title
         FROM feedback f
         JOIN users u ON f.user_id = u.id
         JOIN feedback_notifications fn ON f.id = fn.feedback_id
         JOIN ideas i ON f.idea_id = i.id
         WHERE fn.user_id = ?
         ORDER BY fn.unread DESC, f.created_at DESC`,
        [userId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE feedback_notifications SET unread = 0 WHERE id = ?',
        [notificationId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const createFeedbackNotification = async (
  feedbackId: number,
  ideaOwnerId: number,
  commenterId: number
): Promise<void> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO feedback_notifications (feedback_id, user_id, unread) VALUES (?, ?, 1)',
        [feedbackId, ideaOwnerId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
