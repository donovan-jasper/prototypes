import { CalendarEvent, HealthData } from '../../types';

interface DetectedHabit {
  id: string;
  name: string;
  frequency: number;
  dates: string[];
}

export const identifyHabitsFromEvents = (events: (CalendarEvent | HealthData)[]): DetectedHabit[] => {
  // Group events by type
  const eventGroups: Record<string, (CalendarEvent | HealthData)[]> = {};

  events.forEach(event => {
    const type = 'type' in event ? event.type : 'other';
    if (!eventGroups[type]) {
      eventGroups[type] = [];
    }
    eventGroups[type].push(event);
  });

  // Identify habits from groups
  const habits: DetectedHabit[] = [];

  Object.entries(eventGroups).forEach(([type, groupEvents]) => {
    // Only consider groups with at least 3 events as potential habits
    if (groupEvents.length >= 3) {
      const dates = groupEvents.map(event => {
        if ('startDate' in event) {
          return event.startDate.toISOString().split('T')[0];
        } else {
          return event.date.toISOString().split('T')[0];
        }
      });

      // Count unique dates
      const uniqueDates = [...new Set(dates)];

      habits.push({
        id: type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        frequency: uniqueDates.length,
        dates: uniqueDates
      });
    }
  });

  return habits;
};
