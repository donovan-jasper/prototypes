import { schedulePersistentAlert, dismissAlert, acknowledgeAlert, rescheduleAlerts } from '../../src/services/notifications/notificationService';
import * as Notifications from 'expo-notifications';
import { getEventById } from '../../src/services/data/eventRepository';

// Mock Expo Notifications module
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  dismissNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidNotificationPriority: {
    HIGH: 'high',
    MAX: 'max',
  },
}));

// Mock event repository
jest.mock('../../src/services/data/eventRepository', () => ({
  getEventById: jest.fn(),
}));

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule a persistent alert with escalation', async () => {
    const event = {
      id: 'event-123',
      title: 'Important Meeting',
      startDate: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
      isCritical: true,
      alertSettings: {
        escalationPattern: [0, 10, 30], // at 0, 10, 30 seconds before event
        sound: 'custom_sound.mp3',
        vibration: true,
      },
    };

    await schedulePersistentAlert(event);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3); // Initial + 2 escalations
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Vigil Alert: Important Meeting',
          body: expect.stringContaining('starts in less than a minute'),
          sound: 'custom_sound.mp3',
          sticky: true, // Persistent notification
        }),
        trigger: expect.objectContaining({
          date: expect.any(Date),
        }),
      })
    );
  });

  it('should schedule alerts with custom escalation times when provided', async () => {
    const event = {
      id: 'event-456',
      title: 'Doctor Appointment',
      startDate: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
      alertSettings: {
        escalationPattern: [60], // Default in event
      },
    };

    const customEscalation = [0, 30, 60, 120]; // Override with custom times

    await schedulePersistentAlert(event, customEscalation);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(4);
  });

  it('should dismiss all scheduled alerts for a given event ID', async () => {
    Notifications.getAllScheduledNotificationsAsync.mockResolvedValueOnce([
      { identifier: 'vigil-event-123-0', content: { data: { eventId: 'event-123' } } },
      { identifier: 'vigil-event-123-1', content: { data: { eventId: 'event-123' } } },
      { identifier: 'vigil-event-456-0', content: { data: { eventId: 'event-456' } } },
    ]);

    await dismissAlert('event-123');

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('vigil-event-123-0');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('vigil-event-123-1');
  });

  it('should acknowledge an alert by dismissing it and logging the action', async () => {
    Notifications.getAllScheduledNotificationsAsync.mockResolvedValueOnce([
      { identifier: 'vigil-event-123-0', content: { data: { eventId: 'event-123' } } },
      { identifier: 'vigil-event-123-1', content: { data: { eventId: 'event-123' } } },
    ]);

    const notificationId = 'some-notification-id';
    const eventId = 'event-123';
    await acknowledgeAlert(notificationId, eventId);
    
    expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(notificationId);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it('should reschedule alerts with new escalation pattern', async () => {
    const event = {
      id: 'event-789',
      title: 'Team Standup',
      startDate: new Date(Date.now() + 600000).toISOString(), // 10 minutes from now
      alertSettings: {
        escalationPattern: [60],
      },
    };

    getEventById.mockResolvedValueOnce(event);
    Notifications.getAllScheduledNotificationsAsync.mockResolvedValueOnce([
      { identifier: 'vigil-event-789-0', content: { data: { eventId: 'event-789' } } },
    ]);

    const newEscalation = [0, 30, 60, 90];
    await rescheduleAlerts('event-789', newEscalation);

    // Should cancel old alerts
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    
    // Should schedule new alerts
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(4);
  });

  it('should include escalation level indicators in alert body', async () => {
    const event = {
      id: 'event-999',
      title: 'Critical Meeting',
      startDate: new Date(Date.now() + 120000).toISOString(), // 2 minutes from now
      alertSettings: {
        escalationPattern: [0, 30, 60],
      },
    };

    await schedulePersistentAlert(event);

    const calls = Notifications.scheduleNotificationAsync.mock.calls;
    
    // First alert (level 0) should have no urgency indicators
    expect(calls[0][0].content.body).not.toContain('⚠️');
    
    // Second alert (level 1) should have urgency indicators
    expect(calls[1][0].content.body).toContain('⚠️');
    
    // Third alert (level 2) should have more urgency indicators
    expect(calls[2][0].content.body).toContain('⚠️');
  });
});
