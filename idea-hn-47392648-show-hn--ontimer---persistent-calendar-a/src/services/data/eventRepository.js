import db from './database';

// NOTE: Assumes the 'events' table has an 'is_acknowledged' column, e.g.:
// CREATE TABLE IF NOT EXISTS events (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     ...
//     is_acknowledged INTEGER DEFAULT 0, -- 0 for false, 1 for true
//     ...
// );

export const saveEvent = (event) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO events (title, description, start_date, end_date, calendar_id, external_id, is_critical, alert_settings, location, is_acknowledged) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            event.isAcknowledged ? 1 : 0, // Default to 0 if not provided
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
          `UPDATE events SET title=?, description=?, start_date=?, end_date=?, calendar_id=?, external_id=?, is_critical=?, alert_settings=?, location=?, is_acknowledged=?, updated_at=CURRENT_TIMESTAMP 
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
            event.isAcknowledged ? 1 : 0,
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

/**
 * Updates specific status fields of an event.
 * @param {string} id - The ID of the event.
 * @param {Object} updates - An object containing fields to update (e.g., { isAcknowledged: true }).
 * @returns {Promise<number>} A promise that resolves with the number of rows affected.
 */
export const updateEventStatus = (id, updates) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        const fields = [];
        const values = [];

        if (updates.isAcknowledged !== undefined) {
          fields.push('is_acknowledged = ?');
          values.push(updates.isAcknowledged ? 1 : 0);
        }
        // Add other status fields here if needed in the future
        // e.g., if (updates.isSnoozed !== undefined) { ... }

        if (fields.length === 0) {
          return resolve(0); // No fields to update
        }

        const query = `UPDATE events SET ${fields.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id=?`;
        values.push(id);

        tx.executeSql(
          query,
          values,
          (_, result) => resolve(result.rowsAffected),
          (_, error) => {
            console.error('Error updating event status:', error);
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
            const event = rows._array.length > 0 ? rows._array[0] : null;
            if (event) {
              // Convert integer back to boolean for isCritical and isAcknowledged
              event.isCritical = event.is_critical === 1;
              event.isAcknowledged = event.is_acknowledged === 1;
              // Parse alert_settings JSON string back to object
              event.alertSettings = event.alert_settings ? JSON.parse(event.alert_settings) : {};
            }
            resolve(event);
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
            const events = rows._array.map(event => ({
              ...event,
              isCritical: event.is_critical === 1,
              isAcknowledged: event.is_acknowledged === 1,
              alertSettings: event.alert_settings ? JSON.parse(event.alert_settings) : {},
            }));
            resolve(events);
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
            const events = rows._array.map(event => ({
              ...event,
              isCritical: event.is_critical === 1,
              isAcknowledged: event.is_acknowledged === 1,
              alertSettings: event.alert_settings ? JSON.parse(event.alert_settings) : {},
            }));
            resolve(events);
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
            const events = rows._array.map(event => ({
              ...event,
              isCritical: event.is_critical === 1,
              isAcknowledged: event.is_acknowledged === 1,
              alertSettings: event.alert_settings ? JSON.parse(event.alert_settings) : {},
            }));
            resolve(events);
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
