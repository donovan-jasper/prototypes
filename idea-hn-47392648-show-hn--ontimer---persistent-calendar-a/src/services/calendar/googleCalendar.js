import { getValidAccessToken } from '../auth/googleAuth';
import { saveEvent, getEventsByCalendarId, deleteEvent } from '../data/eventRepository';

const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Fetches events from Google Calendar API
 * @param {string} calendarId - The calendar ID
 * @param {Date} timeMin - Start time for events
 * @param {Date} timeMax - End time for events
 * @returns {Promise<Array>} Array of parsed events
 */
export const fetchGoogleCalendarEvents = async (calendarId, timeMin = new Date(), timeMax = null) => {
  try {
    const accessToken = await getValidAccessToken(calendarId);
    
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });

    if (timeMax) {
      params.append('timeMax', timeMax.toISOString());
    }

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch events');
    }

    const data = await response.json();
    
    return parseGoogleEvents(data.items || [], calendarId);
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};

/**
 * Parses Google Calendar event data into our internal format
 * @param {Array} googleEvents - Raw Google Calendar events
 * @param {string} calendarId - The calendar ID
 * @returns {Array} Parsed events
 */
const parseGoogleEvents = (googleEvents, calendarId) => {
  return googleEvents.map(event => {
    const startTime = event.start?.dateTime || event.start?.date;
    const endTime = event.end?.dateTime || event.end?.date;
    
    return {
      externalId: event.id,
      calendarId,
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      location: event.location || '',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isAllDay: !event.start?.dateTime,
      status: event.status || 'confirmed',
      htmlLink: event.htmlLink,
      created: new Date(event.created),
      updated: new Date(event.updated),
    };
  });
};

/**
 * Syncs Google Calendar events to local storage
 * @param {string} calendarId - The calendar ID
 * @returns {Promise<{added: number, updated: number, deleted: number}>}
 */
export const syncGoogleCalendar = async (calendarId) => {
  try {
    // Fetch events from the next 90 days
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 90);

    const googleEvents = await fetchGoogleCalendarEvents(calendarId, timeMin, timeMax);
    const localEvents = await getEventsByCalendarId(calendarId);

    let added = 0;
    let updated = 0;
    let deleted = 0;

    // Create a map of local events by external ID
    const localEventsMap = new Map(
      localEvents.map(event => [event.externalId, event])
    );

    // Create a set of external IDs from Google
    const googleEventIds = new Set(googleEvents.map(event => event.externalId));

    // Add or update events from Google
    for (const googleEvent of googleEvents) {
      const localEvent = localEventsMap.get(googleEvent.externalId);

      if (!localEvent) {
        // New event
        await saveEvent(googleEvent);
        added++;
      } else {
        // Check if event was updated
        const googleUpdated = new Date(googleEvent.updated).getTime();
        const localUpdated = new Date(localEvent.updated).getTime();

        if (googleUpdated > localUpdated) {
          await saveEvent({
            ...googleEvent,
            id: localEvent.id, // Preserve local ID
          });
          updated++;
        }
      }
    }

    // Delete events that no longer exist in Google Calendar
    for (const localEvent of localEvents) {
      if (!googleEventIds.has(localEvent.externalId)) {
        await deleteEvent(localEvent.id);
        deleted++;
      }
    }

    // Update last sync time
    const { updateCalendarLastSync } = require('../data/settingsRepository');
    await updateCalendarLastSync(calendarId, new Date());

    return { added, updated, deleted };
  } catch (error) {
    console.error('Error syncing Google Calendar:', error);
    throw error;
  }
};

/**
 * Gets list of available calendars for the user
 * @param {string} calendarId - The primary calendar ID (used to get access token)
 * @returns {Promise<Array>} List of calendars
 */
export const getGoogleCalendarList = async (calendarId) => {
  try {
    const accessToken = await getValidAccessToken(calendarId);

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/users/me/calendarList`,
      {
        headers: {
