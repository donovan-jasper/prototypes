import { CalendarEvent } from '../../types';

export const calendarService = {
  async getEvents(): Promise<CalendarEvent[]> {
    // In a real app, this would connect to Google Calendar or Apple Calendar
    // For demo purposes, we return mock data
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'Morning Workout',
            startDate: new Date('2023-05-01T07:00:00'),
            endDate: new Date('2023-05-01T08:00:00'),
            type: 'workout'
          },
          {
            id: '2',
            title: 'Team Meeting',
            startDate: new Date('2023-05-01T10:00:00'),
            endDate: new Date('2023-05-01T11:00:00'),
            type: 'meeting'
          },
          {
            id: '3',
            title: 'Evening Meditation',
            startDate: new Date('2023-05-01T20:00:00'),
            endDate: new Date('2023-05-01T20:30:00'),
            type: 'meditation'
          },
          {
            id: '4',
            title: 'Morning Workout',
            startDate: new Date('2023-05-02T07:00:00'),
            endDate: new Date('2023-05-02T08:00:00'),
            type: 'workout'
          },
          {
            id: '5',
            title: 'Evening Meditation',
            startDate: new Date('2023-05-02T20:00:00'),
            endDate: new Date('2023-05-02T20:30:00'),
            type: 'meditation'
          },
          {
            id: '6',
            title: 'Morning Workout',
            startDate: new Date('2023-05-03T07:00:00'),
            endDate: new Date('2023-05-03T08:00:00'),
            type: 'workout'
          },
          {
            id: '7',
            title: 'Evening Meditation',
            startDate: new Date('2023-05-03T20:00:00'),
            endDate: new Date('2023-05-03T20:30:00'),
            type: 'meditation'
          }
        ]);
      }, 1000);
    });
  }
};
