// This is a mock implementation for demonstration purposes.
// In a real app, this would interact with SQLite via database.js.

const mockEvents = {}; // In-memory store for mock events

/**
 * Saves an event to the mock store.
 * @param {Object} event - The event object to save. Must have an 'id'.
 * @returns {Promise<Object>} The saved event object.
 */
export const saveEvent = async (event) => {
  console.log('Mock: Saving event', event.id);
  mockEvents[event.id] = { ...event, acknowledgedStatus: 'pending' };
  return mockEvents[event.id];
};

/**
 * Retrieves an event by its ID from the mock store.
 * @param {string} eventId - The ID of the event to retrieve.
 * @returns {Promise<Object|null>} The event object if found, otherwise null.
 */
export const getEventById = async (eventId) => {
  console.log('Mock: Getting event by ID', eventId);
  return mockEvents[eventId] || null;
};

/**
 * Updates the acknowledgment status of an event in the mock store.
 * @param {string} eventId - The ID of the event to update.
 * @param {string} status - The new status (e.g., 'acknowledged', 'snoozed', 'pending').
 * @param {string|null} [snoozeUntil=null] - ISO string date if snoozed, indicating when to re-alert.
 * @returns {Promise<Object|null>} The updated event object if found, otherwise null.
 */
export const updateEventAcknowledgmentStatus = async (eventId, status, snoozeUntil = null) => {
  console.log(`Mock: Updating event ${eventId} status to ${status}, snoozeUntil: ${snoozeUntil}`);
  if (mockEvents[eventId]) {
    mockEvents[eventId].acknowledgedStatus = status;
    if (snoozeUntil) {
      mockEvents[eventId].snoozeUntil = snoozeUntil;
    } else {
      delete mockEvents[eventId].snoozeUntil;
    }
    return mockEvents[eventId];
  }
  return null;
};

/**
 * Retrieves all events from the mock store.
 * @returns {Promise<Array<Object>>} An array of all events.
 */
export const getAllEvents = async () => {
  console.log('Mock: Getting all events');
  return Object.values(mockEvents);
};

/**
 * Clears all events from the mock store.
 */
export const clearMockEvents = () => {
  console.log('Mock: Clearing all events');
  Object.keys(mockEvents).forEach(key => delete mockEvents[key]);
};
