import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCalendarsAsync: jest.fn().mockResolvedValue([{ id: '1', entityType: 'event' }]),
  getEventsAsync: jest.fn().mockResolvedValue([]),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
}));
