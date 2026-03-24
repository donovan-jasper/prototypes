import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getEventById, updateEventStatus } from '../data/eventRepository'; // Import updateEventStatus

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Schedules a persistent alert with escalating notifications for an event
 * @param {Object} event - The event object containing alert settings
 */
export const schedulePersistentAlert = async (event) => {
  try {
    // Request notification permissions if not already granted
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        throw new Error('Notification permission not granted');
      }
    }

    // Parse alert settings
    const alertSettings = event.alertSettings || {};
    const escalationPattern = alertSettings.escalationPattern || [0]; // Default to just at event time
    const sound = alertSettings.sound || 'default';
    const vibration = alertSettings.vibration !== undefined ? alertSettings.vibration : true;
    
    // Schedule each notification in the escalation pattern
    for (let i = 0; i < escalationPattern.length; i++) {
      const secondsBefore = escalationPattern[i];
      
      // Calculate trigger time
      const eventDate = new Date(event.startDate);
      const triggerDate = new Date(eventDate.getTime() - secondsBefore * 1000);
      const now = new Date();
      
      // Only schedule if the trigger time is in the future
      if (triggerDate > now) {
        const notificationId = `vigil-${event.id}-${i}`;
        
        await Notifications.scheduleNotificationAsync({
          identifier: notificationId,
          content: {
            title: `Vigil Alert: ${event.title}`,
            body: getAlertBody(event, secondsBefore),
            sound: sound === 'default' ? undefined : sound,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            sticky: true, // Persistent notification
            data: {
              eventId: event.id,
              notificationType: 'persistent-alert',
              escalationLevel: i,
            },
          },
          trigger: {
            date: triggerDate,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error scheduling persistent alert:', error);
    throw error;
  }
};

/**
 * Helper function to generate alert body based on time before event
 * @param {Object} event - The event object
 * @param {number} secondsBefore - Seconds before the event the alert is triggered
 * @returns {string} The alert body text
 */
const getAlertBody = (event, secondsBefore) => {
  if (secondsBefore === 0) {
    return `${event.title} is happening now!`;
  } else if (secondsBefore < 60) {
    return `${event.title} starts in less than a minute!`;
  } else if (secondsBefore < 3600) {
    const minutes = Math.ceil(secondsBefore / 60);
    return `${event.title} starts in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
  } else {
    const hours = Math.ceil(secondsBefore / 3600);
    return `${event.title} starts in ${hours} hour${hours > 1 ? 's' : ''}.`;
  }
};

/**
 * Schedules a full-screen alert for critical events
 * @param {Object} event - The event object
 */
export const scheduleFullScreenAlert = async (event) => {
  try {
    const alertSettings = event.alertSettings || {};
    const sound = alertSettings.fullScreenSound || 'default';
    
    // Calculate trigger time (typically at the event start time)
    const eventDate = new Date(event.startDate);
    const now = new Date();
    
    if (eventDate > now) {
      const notificationId = `vigil-fullscreen-${event.id}`;
      
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: `CRITICAL: ${event.title}`,
          body: `This is a critical event that requires immediate attention!`,
          sound: sound === 'default' ? undefined : sound,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            eventId: event.id,
            notificationType: 'fullscreen-alert',
            isCritical: true,
          },
        },
        trigger: {
          date: eventDate,
        },
      });
    }
  } catch (error) {
    console.error('Error scheduling full-screen alert:', error);
    throw error;
  }
};

/**
 * Dismisses all scheduled notifications associated with a specific event.
 * This function is intended to cancel all future escalations for an event.
 * @param {string} eventId - The ID of the event
 */
export const dismissAlert = async (eventId) => {
  try {
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Filter notifications related to this event
    const eventNotifications = scheduledNotifications.filter(
      notification => notification.content.data?.eventId === eventId
    );
    
    // Cancel each notification
    for (const notification of eventNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
    console.log(`Dismissed all scheduled notifications for event: ${eventId}`);
  } catch (error) {
    console.error('Error dismissing scheduled alerts:', error);
    throw error;
  }
};

/**
 * Acknowledges an alert by dismissing the specific notification that triggered the action,
 * canceling all further scheduled notifications for the event, and updating the event's status.
 * @param {string} notificationId - The ID of the specific notification that triggered the action (e.g., the full-screen alert)
 * @param {string} eventId - The ID of the event
 */
export const acknowledgeAlert = async (notificationId, eventId) => {
  try {
    // 1. Dismiss the specific notification that triggered the action
    if (notificationId) {
      await Notifications.dismissNotificationAsync(notificationId);
      console.log(`Dismissed specific notification: ${notificationId}`);
    }

    // 2. Cancel all scheduled notifications associated with this event
    // This stops all further escalations for that event.
    await dismissAlert(eventId);
    console.log(`Cancelled all scheduled notifications for event: ${eventId}`);

    // 3. Update the event's status in the local database
    await updateEventStatus(eventId, { isAcknowledged: true });
    console.log(`Event ${eventId} marked as acknowledged.`);

  } catch (error) {
    console.error('Error acknowledging alert:', error);
    throw error;
  }
};
