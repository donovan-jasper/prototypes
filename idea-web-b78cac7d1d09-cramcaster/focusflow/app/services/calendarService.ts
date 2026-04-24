import * as Calendar from 'expo-calendar';

export const getCalendarEvents = async () => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Calendar permission not granted');
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const events = await Calendar.getEventsAsync(
    calendars.map(calendar => calendar.id),
    new Date(),
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
  );

  return events;
};

export const isEventInProgress = (events: Calendar.Event[], currentTime: Date) => {
  return events.some(event => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    return currentTime >= startDate && currentTime <= endDate;
  });
};
