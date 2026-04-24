import * as Calendar from 'expo-calendar';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

export const requestCalendarPermissions = async (): Promise<boolean> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
};

export const fetchCalendarEvents = async (days: number = 7): Promise<CalendarEvent[]> => {
  const hasPermission = await requestCalendarPermissions();
  if (!hasPermission) return [];

  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (calendars.length === 0) return [];

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    const events: CalendarEvent[] = [];

    for (const calendar of calendars) {
      const calendarEvents = await Calendar.getEventsAsync(
        [calendar.id],
        startDate,
        today
      );

      events.push(
        ...calendarEvents.map(event => ({
          id: event.id,
          title: event.title,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          location: event.location,
        }))
      );
    }

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};

export const identifyHabitsFromEvents = (events: CalendarEvent[]): string[] => {
  const habitKeywords = ['meditation', 'reading', 'yoga', 'workout', 'study', 'journal', 'exercise', 'walk', 'run'];
  const detectedHabits = new Set<string>();

  events.forEach(event => {
    const titleLower = event.title.toLowerCase();
    habitKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) {
        detectedHabits.add(keyword);
      }
    });
  });

  return Array.from(detectedHabits);
};

export const calendarService = {
  requestCalendarPermissions,
  fetchCalendarEvents,
  identifyHabitsFromEvents,
};
