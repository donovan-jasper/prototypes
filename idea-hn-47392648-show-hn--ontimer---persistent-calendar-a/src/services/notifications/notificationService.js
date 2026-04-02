import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getEventById, updateEventAcknowledgmentStatus } from '../data/eventRepository';
import { getEventAlertSettings } from '../data/settingsRepository';
import { getNextAlertTime } from '../../utils/dateUtils';

// Define notification categories for interactive alerts
const VIGIL_ALERT_CATEGORY_ID = 'VIGIL_ALERT_CATEGORY';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { notificationType, isCritical } = notification.request.content.data || {};

    // For critical/full-screen alerts, we might want to suppress the default system alert
    // and let our custom FullScreenAlert component handle the UI.
    // However, for persistent notifications, we still want the system alert/sound.
    const shouldShowAlert = !(isCritical || notificationType === 'fullscreen-alert');

    return {
      shouldShowAlert: true, // Always show system alert for now, FullScreenAlert will overlay
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

// Helper to get default alert settings or event-specific ones
const getDefaultAlertSettings = async (eventId) => {
  // In a real app, this would fetch from settingsRepository or eventRepository
  // For now, return a sensible default
  return {
    escalationPattern: [0], // Trigger immediately
    sound: 'default', // Use default sound
    vibration: true,
    isCritical: true, // Snoozed alerts should be critical
  };
};

/**
 * Schedules a single persistent notification for an event.
 * This is a simplified version for scheduling individual alerts (like snoozes).
 * The full escalation logic would be in a more comprehensive `scheduleEventAlerts` function.
 * @param {Object} e
 * @param {string} e.eventId
 * @param {Date} e.eventTime
 * @param {Object} [alertSettings]
 * @param {number[]} [alertSettings.escalationPattern]
 * @param {string} [alertSettings.sound]
 * @param {boolean} [alertSettings.vibration]
 */
export const schedulePersistentAlert = async (e, alertSettings = {}) => {
  const { eventId, eventTime } = e;
  const { escalationPattern = [0], sound = 'default', vibration = true } = alertSettings;

  // Calculate next alert time based on escalation pattern
  const nextAlertTime = getNextAlertTime(eventTime, escalationPattern[0]);

  // Schedule notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Vigil Alert',
      body: `Event ${eventId} is about to start!`,
      sound: sound,
      sticky: true, // Persistent notification
      data: {
        eventId,
        notificationType: 'persistent-alert',
      },
    },
    trigger: {
      seconds: Math.floor((nextAlertTime.getTime() - Date.now()) / 1000),
    },
  });
};

/**
 * Dismisses all scheduled notifications for a given event ID.
 * @param {string} eventId
 */
export const dismissAlert = async (eventId) => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const eventNotifications = scheduledNotifications.filter(notification => notification.content.data.eventId === eventId);

  eventNotifications.forEach(notification => {
    Notifications.cancelScheduledNotificationAsync(notification.identifier);
  });
};

/**
 * Acknowledges an alert by dismissing it and logging the action.
 * @param {string} notificationId
 * @param {string} eventId
 */
export const acknowledgeAlert = async (notificationId, eventId) => {
  await Notifications.dismissNotificationAsync(notificationId);
  await updateEventAcknowledgmentStatus(eventId, true);
};
