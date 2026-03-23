import db from './database';

export const saveEvent = (event) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO events (title, description, start_date, end_date, calendar_id, external_id, is_critical, alert_settings, location) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            event.title,
            event.description || '',
            event.startDate,
            event.endDate,
            event.calendarId || null,
            event.externalId || null,
            event.isCritical ? 1 : 0,
            JSON.stringify(event.alertSettings || {}),
            event.location || null,
          ],
          (_, result) => resolve(result.insertId),
          (_, error) => {
            console.error('Error saving event:', error);
            reject(error);
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

export const updateEvent = (id, event) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE events SET title=?, description=?, start_date=?, end_date=?, calendar_id=?, external_id=?, is_critical=?, alert_settings=?, location=?, updated_at=CURRENT_TIMESTAMP 
           WHERE id=?`,
          [
            event.title,
            event.description || '',
            event.startDate,
            event.endDate,
            event.calendarId || null,
            event.externalId || null,
            event.isCritical ? 1 : 0,
            JSON.stringify(event.alertSettings || {}),
            event.location || null,
            id,
          ],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => {
            console.error('Error updating event:', error);
            reject(error);
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

export const deleteEvent = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM events WHERE id = ?',
          [id],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => {
            console.error('Error deleting event:', error);
            reject(error);
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

export const getEventById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM events WHERE id = ?',
          [id],
          (_, { rows }) => {
            resolve(rows._array.length > 0 ? rows._array[0] : null);
          },
          (_, error) => {
            console.error('Error getting event:', error);
            reject(error);
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

export const getAllEvents = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM events ORDER BY start_date ASC',
          [],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            console.error('Error getting all events:', error);
            reject(error);
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

export const getUpcomingEvents = () => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM events WHERE start_date >= ? ORDER BY start_date ASC LIMIT 10',
          [now],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            console.error('Error getting upcoming events:', error);
            reject(error);
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

export const getEventsByCalendarId = (calendarId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM events WHERE calendar_id = ? ORDER BY start_date ASC',
          [calendarId],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            console.error('Error getting events by calendar:', error);
            reject(error);
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
