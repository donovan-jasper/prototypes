// This is a mock implementation for demonstration purposes.
// In a real app, this would interact with SQLite via database.js.

const mockSettings = {
  defaultAlertSettings: {
    escalationPattern: [0, 10, 30], // Default: at 0s, 10s, 30s before event
    sound: 'default', // 'default' or a custom sound file name
    vibration: true,
    isCritical: false, // Default events are not critical unless specified
  },
  eventSpecificAlertSettings: {}, // Store overrides here
};

/**
 * Retrieves the alert settings for a specific event, or default settings if none are found.
 * @param {string} eventId - The ID of the event.
 * @returns {Promise<Object>} The alert settings.
 */
export const getEventAlertSettings = async (eventId) => {
  console.log(`Mock: Getting alert settings for event ${eventId}`);
  // For now, just return default settings. In a real app, this would check event-specific overrides.
  return mockSettings.defaultAlertSettings;
};

/**
 * Updates default alert settings.
 * @param {Object} newSettings - The new default settings.
 */
export const updateDefaultAlertSettings = async (newSettings) => {
  console.log('Mock: Updating default alert settings', newSettings);
  mockSettings.defaultAlertSettings = { ...mockSettings.defaultAlertSettings, ...newSettings };
};

/**
 * Updates event-specific alert settings.
 * @param {string} eventId - The ID of the event.
 * @param {Object} settings - The event-specific settings.
 */
export const updateEventSpecificAlertSettings = async (eventId, settings) => {
  console.log(`Mock: Updating event-specific alert settings for ${eventId}`, settings);
  mockSettings.eventSpecificAlertSettings[eventId] = {
    ...mockSettings.defaultAlertSettings, // Start with defaults
    ...mockSettings.eventSpecificAlertSettings[eventId], // Apply existing overrides
    ...settings, // Apply new overrides
  };
};

/**
 * Clears all mock settings.
 */
export const clearMockSettings = () => {
  console.log('Mock: Clearing all settings');
  mockSettings.defaultAlertSettings = {
    escalationPattern: [0, 10, 30],
    sound: 'default',
    vibration: true,
    isCritical: false,
  };
  mockSettings.eventSpecificAlertSettings = {};
};
