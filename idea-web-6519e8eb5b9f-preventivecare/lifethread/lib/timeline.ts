import { getDatabase } from './database';

export const addTimelineEvent = async (event) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT INTO timeline_events (type, title, date, notes, attachments) VALUES (?, ?, ?, ?, ?);',
          [event.type, event.title, event.date.toISOString(), event.notes, event.attachments || null],
          (_, { insertId }) => {
            resolve({ id: insertId, ...event });
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const getTimelineEvents = async (startDate = null, endDate = null, userId = 1) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        let query = 'SELECT * FROM timeline_events WHERE user_id = ?';
        const params = [userId];

        if (startDate && endDate) {
          query += ' AND date BETWEEN ? AND ?';
          params.push(startDate.toISOString(), endDate.toISOString());
        }

        query += ' ORDER BY date DESC;';

        tx.executeSql(
          query,
          params,
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const updateTimelineEvent = async (id, updates) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        const setClause = Object.keys(updates)
          .map(key => `${key} = ?`)
          .join(', ');
        const params = [...Object.values(updates), id];

        tx.executeSql(
          `UPDATE timeline_events SET ${setClause} WHERE id = ?;`,
          params,
          (_, { rowsAffected }) => {
            if (rowsAffected > 0) {
              resolve({ id, ...updates });
            } else {
              reject(new Error('Event not found'));
            }
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const deleteTimelineEvent = async (id) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'DELETE FROM timeline_events WHERE id = ?;',
          [id],
          (_, { rowsAffected }) => {
            if (rowsAffected > 0) {
              resolve({ id });
            } else {
              reject(new Error('Event not found'));
            }
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};
