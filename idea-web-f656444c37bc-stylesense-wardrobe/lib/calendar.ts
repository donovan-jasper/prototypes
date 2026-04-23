import * as Calendar from 'expo-calendar';

export async function getTodayEvents(): Promise<string[]> {
  try {
    // Request calendar permissions
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      console.log('Calendar permissions not granted');
      return [];
    }

    // Get all calendars
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (calendars.length === 0) {
      return [];
    }

    // Get today's date range
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch events for today
    const events = await Calendar.getEventsAsync(
      calendars.map(calendar => calendar.id),
      startOfDay,
      endOfDay
    );

    // Extract event titles
    return events.map(event => event.title);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}
