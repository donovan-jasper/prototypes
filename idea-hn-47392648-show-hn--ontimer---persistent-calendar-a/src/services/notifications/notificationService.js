import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getEventById } from '../data/eventRepository';

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
 * Dismisses all scheduled notifications for a specific event
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
  } catch (error) {
    console.error('Error dismissing alert:', error);
    throw error;
  }
};

/**
 * Acknowledges an alert by dismissing the notification and updating event status
 * @param {string} notificationId - The ID of the notification
 * @param {string} eventId - The ID of the event
 */
export const acknowledgeAlert = async (notificationId, eventId) => {
  try {
    // Dismiss the notification
    await Notifications.dismissNotificationAsync(notificationId);
    
    // Update event status in database to mark as acknowledged
    const event = await getEventById(eventId);
    if (event) {
      const updatedEvent = {
        ...event,
        acknowledged: true,
        acknowledgedAt: new Date().toISOString(),
      };
      // Note: We assume there's an updateEvent function in eventRepository
      // This might need to be added to the repository
    }
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    throw error;
  }
};

/**
 * Gets the appropriate alert body based on time remaining
 * @param {Object} event - The event object
 * @param {number} secondsBefore - Seconds before the event
 * @returns {string} The alert body text
 */
const getAlertBody = (event, secondsBefore) => {
  if (secondsBefore === 0) {
    return `${event.title} starts now!`;
  } else if (secondsBefore < 60) {
    return `${event.title} starts in ${secondsBefore} seconds!`;
  } else if (secondsBefore < 3600) {
    const minutes = Math.floor(secondsBefore / 60);
    return `${event.title} starts in ${minutes} minute${minutes !== 1 ? 's' : ''}!`;
  } else {
    const hours = Math.floor(secondsBefore / 3600);
    return `${event.title} starts in ${hours} hour${hours !== 1 ? 's' : ''}!`;
  }
};

/**
 * Sets up notification listeners for foreground/background handling
 * @param {Function} onFullScreenAlert - Callback when a full-screen alert should be shown
 */
export const setupNotificationListeners = (onFullScreenAlert) => {
  // Handle notification received while app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received in foreground:', notification);
    
    // Check if this is a critical event that requires full-screen alert
    const eventType = notification.request.content.data?.notificationType;
    const eventId = notification.request.content.data?.eventId;
    
    if (eventType === 'fullscreen-alert' && onFullScreenAlert) {
      onFullScreenAlert(eventId);
    }
  });

  // Handle notification response (when user interacts with notification)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response received:', response);
    
    const notification = response.notification;
    const eventType = notification.request.content.data?.notificationType;
    const eventId = notification.request.content.data?.eventId;
    
    // Acknowledge the alert when user responds
    if (eventId) {
      acknowledgeAlert(notification.request.identifier, eventId);
    }
    
    // If it's a full-screen alert, ensure the full-screen component is shown
    if (eventType === 'fullscreen-alert' && onFullScreenAlert) {
      onFullScreenAlert(eventId);
    }
  });

  // Return cleanup function
  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
};

/**
 * Cancels all scheduled notifications
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};
