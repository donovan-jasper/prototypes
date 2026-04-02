import db from './database';

/**
 * Maps a database row object to a JavaScript event object (camelCase, parsed JSON).
 * @param {Object} row - The database row.
 * @returns {Object|null} The mapped event object or null if row is null.
 */
const mapRowToEvent = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    externalId: row.external_id,
    calendarId: row.calendar_id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    isCritical: row.is_critical === 1, 
    alertSettings: row.alert_settings ? JSON.parse(row.alert_settings) : null,
    acknowledgmentStatus: row.acknowledgment_status,
    snoozeUntil: row.snooze_until,
    lastModified: row.last_modified,
    createdAt: row.created_at,
  };
};

/**
 * Maps a JavaScript event object to a database row object (snake_case, JSON stringified).
 * @param {Object} event - The event object.
 * @returns {Object} The mapped database row object.
 */
const mapEventToRow = (event) => {
  const now = new Date().toISOString();
  return {
    external_id: event.externalId || null,
    calendar_id: event.calendarId || null,
    title: event.title,
    description: event.description || null,
    start_date: event.startDate,
    end_date: event.endDate,
    location: event.location || null,
    is_critical: event.isCritical ? 1 : 0, 
    alert_settings: event.alertSettings ? JSON.stringify(event.alertSettings) : null,
    acknowledgment_status: event.acknowledgmentStatus || 'pending',
    snooze_until: event.snoozeUntil || null,
    last_modified: now, 
    created_at: event.createdAt || now, 
  };
};

/**
 * Helper function to handle inserting a new event into the database.
 * @param {SQLite.SQLTransaction} tx - The database transaction object.
 * @param {Object} eventRow - The event data mapped to database row format.
 * @param {string} now - Current ISO timestamp.
 * @param {Function} resolve - Promise resolve function.
 * @param {Function} reject - Promise reject function.
 */
const insertNewEvent = (tx, eventRow, now, resolve, reject) => {
  tx.executeSql(
    `INSERT INTO events (
      external_id, calendar_id, title, description, start_date, end_date,
      location, is_critical, alert_settings, acknowledgment_status, snooze_until, last_modified, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      eventRow.external_id, eventRow.calendar_id, eventRow.title, eventRow.description,
      eventRow.start_date, eventRow.end_date, eventRow.location, eventRow.is_critical,
      eventRow.alert_settings, eventRow.acknowledgment_status, eventRow.snooze_until, now, now
    ],
    (_, result) => resolve(mapRowToEvent({ ...eventRow, id: result.insertId, last_modified: now, created_at: now })),
    (_, error) => reject(error)
  );
};

/**
 * Helper function to handle updating an existing event by external ID or inserting if not found.
 * @param {SQLite.SQLTransaction} tx - The database transaction object.
 * @param {Object} event - The original event object.
 * @param {Object} eventRow - The event data mapped to database row format.
 * @param {string} now - Current ISO timestamp.
 * @param {Function} resolve - Promise resolve function.
 * @param {Function} reject - Promise reject function.
 */
const handleExternalIdOrInsert = (tx, event, eventRow, now, resolve, reject) => {
  if (event.externalId && event.calendarId) {
    tx.executeSql(
      `SELECT id FROM events WHERE external_id = ? AND calendar_id = ?;`,
      [event.externalId, event.calendarId],
      (_, { rows }) => {
        if (rows.length > 0) {
          const existingId = rows.item(0).id;
          tx.executeSql(
            `UPDATE events SET
              title = ?, description = ?, start_date = ?, end_date = ?,
              location = ?, is_critical = ?, alert_settings = ?,
              acknowledgment_status = ?, snooze_until = ?, last_modified = ?
             WHERE id = ?;`,
            [
              eventRow.title, eventRow.description, eventRow.start_date, eventRow.end_date,
              eventRow.location, eventRow.is_critical, eventRow.alert_settings,
              eventRow.acknowledgment_status, eventRow.snooze_until, now,
              existingId
            ],
            (_, result) => resolve(mapRowToEvent({ ...eventRow, id: existingId, last_modified: now })),
            (_, error) => reject(error)
          );
        } else {
          insertNewEvent(tx, eventRow, now, resolve, reject);
        }
      },
      (_, error) => reject(error)
    );
  } else {
    insertNewEvent(tx, eventRow, now, resolve, reject);
  }
};

/**
 * Saves an event to the database. Inserts a new event or updates an existing one.
 * It prioritizes updating by local `id`, then by `externalId` + `calendarId`.
 * @param {Object} event - The event object to save.
 * @returns {Promise<Object>} The saved (or updated) event object.
 */
export const saveEvent = async (event) => {
  const eventRow = mapEventToRow(event);
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      if (event.id) {
        tx.executeSql(
          `SELECT id FROM events WHERE id = ?;`,
          [event.id],
          (_, { rows }) => {
            if (rows.length > 0) {
              tx.executeSql(
                `UPDATE events SET
                  external_id = ?, calendar_id = ?, title = ?, description = ?,
                  start_date = ?, end_date = ?, location = ?, is_critical = ?,
                  alert_settings = ?, acknowledgment_status = ?, snooze_until = ?, last_modified = ?
                 WHERE id = ?;`,
                [
                  eventRow.external_id, eventRow.calendar_id, eventRow.title, eventRow.description,
                  eventRow.start_date, eventRow.end_date, eventRow.location, eventRow.is_critical,
                  eventRow.alert_settings, eventRow.acknowledgment_status, eventRow.snooze_until, now,
                  event.id
                ],
                (_, result) => resolve(mapRowToEvent({ ...eventRow, id: event.id, last_modified: now })),
                (_, error) => reject(error)
              );
            } else {
              handleExternalIdOrInsert(tx, event, eventRow, now, resolve, reject);
            }
          },
          (_, error) => reject(error)
        );
      } else {
        handleExternalIdOrInsert(tx, event, eventRow, now, resolve, reject);
      }
    });
  });
};

/**
 * Retrieves a single event by its local ID.
 * @param {number} id - The local ID of the event to retrieve.
 * @returns {Promise<Object|null>} The event object if found, otherwise null.
 */
export const getEventById = async (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM events WHERE id = ?;`,
        [id],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(mapRowToEvent(rows.item(0)));
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

/**
 * Retrieves all events associated with a specific calendar ID.
 * @param {string} calendarId - The ID of the calendar.
 * @returns {Promise<Array<Object>>} An array of event objects.
 */
export const getEventsByCalendarId = async (calendarId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM events WHERE calendar_id = ? ORDER BY start_date ASC;`,
        [calendarId],
        (_, { rows }) => {
          const events = [];
          for (let i = 0; i < rows.length; i++) {
            events.push(mapRowToEvent(rows.item(i)));
          }
          resolve(events);
        },
        (_, error) => reject(error)
      );
    });
  });
};

/**
 * Retrieves all upcoming events, ordered by start date.
 * "Upcoming" means events whose end date is in the future or present.
 * @returns {Promise<Array<Object>>} An array of upcoming event objects.
 */
export const getAllEvents = async () => {
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM events WHERE end_date >= ? ORDER BY start_date ASC;`,
        [now],
        (_, { rows }) => {
          const events = [];
          for (let i = 0; i < rows.length; i++) {
            events.push(mapRowToEvent(rows.item(i)));
          }
          resolve(events);
        },
        (_, error) => reject(error)
      );
    });
  });
};

/**
 * Updates the acknowledgment status and snooze time of an event.
 * @param {number} id - The local ID of the event to update.
 * @param {string} status - The new acknowledgment status (e.g., 'pending', 'acknowledged', 'snoozed').
 * @param {string|null} [snoozeUntil=null] - ISO string date if snoozed, indicating when to re-alert.
 * @returns {Promise<Object|null>} The updated event object if found, otherwise null.
 */
export const updateEventAcknowledgmentStatus = async (id, status, snoozeUntil = null) => {
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE events SET acknowledgment_status = ?, snooze_until = ?, last_modified = ? WHERE id = ?;`,
        [status, snoozeUntil, now, id],
        (_, result) => {
          if (result.rowsAffected > 0) {
            getEventById(id).then(resolve).catch(reject);
          } else {
            resolve(null); 
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

/**
 * Clears all events from the database. Useful for testing or resetting data.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export const clearAllEvents = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM events;`,
        [],
        () => resolve(true),
        (_, error) => reject(error)
      );
    });
  });
};
