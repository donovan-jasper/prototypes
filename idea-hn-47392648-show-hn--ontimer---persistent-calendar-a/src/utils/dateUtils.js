/**
 * Calculates the time for the next alert based on an event's start time and an offset.
 * @param {Date} eventStartTime - The start time of the event.
 * @param {number} offsetSeconds - The number of seconds BEFORE the event start time to trigger the alert.
 * @returns {Date} The calculated alert time.
 */
export const getNextAlertTime = (eventStartTime, offsetSeconds) => {
  const alertTime = new Date(eventStartTime.getTime() - offsetSeconds * 1000);
  console.log(`Calculated alert time for event starting at ${eventStartTime.toISOString()} with offset ${offsetSeconds}s: ${alertTime.toISOString()}`);
  return alertTime;
};

/**
 * Formats a date object into a readable time string.
 * @param {Date} date - The date object to format.
 * @returns {string} Formatted time string (e.g., "10:30 AM").
 */
export const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Formats a date object into a readable date string.
 * @param {Date} date - The date object to format.
 * @returns {string} Formatted date string (e.g., "Oct 26, 2023").
 */
export const formatDate = (date) => {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};
