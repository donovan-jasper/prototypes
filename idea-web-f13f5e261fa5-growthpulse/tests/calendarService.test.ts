import { fetchCalendarEvents, identifyHabitsFromEvents, requestCalendarPermissions } from '../lib/calendarService';
import * as Calendar from 'expo-calendar';

jest.mock('expo-calendar');

describe('Calendar Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestCalendarPermissions', () => {
    it('should return true when permissions are granted', async () => {
      Calendar.requestCalendarPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });

      const result = await requestCalendarPermissions();

      expect(result).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      Calendar.requestCalendarPermissionsAsync = jest.fn().mockResolvedValue({ status: 'denied' });

      const result = await requestCalendarPermissions();

      expect(result).toBe(false);
    });
  });

  describe('fetchCalendarEvents', () => {
    it('should return empty array when permissions are not granted', async () => {
      Calendar.requestCalendarPermissionsAsync = jest.fn().mockResolvedValue({ status: 'denied' });

      const result = await fetchCalendarEvents();

      expect(result).toEqual([]);
    });

    it('should fetch calendar events when permissions are granted', async () => {
      const mockCalendars = [{ id: '1' }];
      const mockEvents = [
        {
          id: '1',
          title: 'Meditation',
          startDate: new Date('2023-10-01'),
          endDate: new Date('2023-10-01'),
          location: 'Home',
        },
      ];

      Calendar.requestCalendarPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
      Calendar.getCalendarsAsync = jest.fn().mockResolvedValue(mockCalendars);
      Calendar.getEventsAsync = jest.fn().mockResolvedValue(mockEvents);

      const result = await fetchCalendarEvents();

      expect(result).toEqual([
        {
          id: '1',
          title: 'Meditation',
          startDate: new Date('2023-10-01'),
          endDate: new Date('2023-10-01'),
          location: 'Home',
        },
      ]);
    });
  });

  describe('identifyHabitsFromEvents', () => {
    it('should identify habits from event titles', () => {
      const events = [
        { id: '1', title: 'Morning Meditation', startDate: new Date(), endDate: new Date() },
        { id: '2', title: 'Evening Reading', startDate: new Date(), endDate: new Date() },
        { id: '3', title: 'Yoga Session', startDate: new Date(), endDate: new Date() },
      ];

      const result = identifyHabitsFromEvents(events);

      expect(result).toEqual(['meditation', 'reading', 'yoga']);
    });

    it('should return empty array when no habits are found', () => {
      const events = [
        { id: '1', title: 'Meeting', startDate: new Date(), endDate: new Date() },
      ];

      const result = identifyHabitsFromEvents(events);

      expect(result).toEqual([]);
    });
  });
});
