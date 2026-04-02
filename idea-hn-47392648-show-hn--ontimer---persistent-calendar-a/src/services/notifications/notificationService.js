import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getEventById, updateEventAcknowledgmentStatus } from '../data/eventRepository'; // Import the new function

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { notificationType, isCritical } = notification.request.content.data || {};
    
    // For critical/full-screen alerts, we might want to suppress the default system alert
    // and let our custom FullScreenAlert component handle the UI.
    // However, for persistent notifications, we still want the system alert/sound.
    // This logic can be refined based on exact UX requirements.
    const shouldShowAlert = !(isCritical || notificationType === 'fullscreen-alert');

    return {
      shouldShowAlert: true, // Always show system alert for now, FullScreenAlert will overlay
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  }),
});

// --- Notification Listener Setup (Conceptual, to be called from App.js or a root hook) ---
let fullScreenAlertCallback = null;

/**
 * Sets the callback function to be invoked when a full-screen alert notification is received.
 * This callback will typically open the FullScreenAlert component.
 * @param {function(string, string): void} callback - A function that takes eventId and notificationId.
 */
export const setFullScreenAlertCallback = (callback) => {
  fullScreenAlertCallback = callback;
};

/**
 * Sets up listeners for incoming notifications and notification responses.
 * This should be called once at the app's root.
 */
export const setupNotificationListeners = () => {
  // Listener for when a notification is received while the app is in foreground
  Notifications.addNotificationReceivedListener(notification => {
    const { eventId, notificationType, isCritical } = notification.request.content.data || {};
    const notificationId = notification.request.identifier;

    // If it's a critical or full-screen alert, trigger the custom UI
    if ((isCritical || notificationType === 'fullscreen-alert') && fullScreenAlertCallback) {
      console.log(`Notification received: ${notificationId} for event ${eventId}. Triggering FullScreenAlert.`);
      fullScreenAlertCallback(eventId, notificationId);
    }
    // Handle other notification types if needed (e.g., update dashboard, show banner)
  });

  // Listener for when a user taps on a notification
  Notifications.addNotificationResponseReceivedListener(response => {
    const { eventId, notificationType, isCritical } = response.notification.request.content.data || {};
    const notificationId = response.notification.request.identifier;

    // If it's a critical or full-screen alert, trigger the custom UI
    if ((isCritical || notificationType === 'fullscreen-alert') && fullScreenAlertCallback) {
      console.log(`Notification response received: ${notificationId} for event ${eventId}. Triggering FullScreenAlert.`);
      fullScreenAlertCallback(eventId, notificationId);
    }
    // Navigate to event details or perform other actions based on notification type
  });
};
// --- End Notification Listener Setup ---


/**
 * Helper function to generate alert body based on escalation level
 * @param {Object} event - The event object
 * @param {number} secondsBefore - Seconds before the event the alert triggers
 * @param {number} escalationLevel - Current escalation level (0-indexed)
 * @param {number} totalEscalations - Total number of escalations
 * @returns {string} The formatted alert body
 */
const getAlertBody = (event, secondsBefore, escalationLevel, totalEscalations) => {
  const minutesBefore = Math.ceil(secondsBefore / 60);
  let body = '';
  if (secondsBefore === 0) {
    body = `${event.title} is happening now!`;
  } else if (minutesBefore > 0) {
    body = `${event.title} starts in ${minutesBefore} minute${minutesBefore > 1 ? 's' : ''}.`;
  } else {
    body = `${event.title} starts in less than a minute.`;
  }

  if (totalEscalations > 1 && escalationLevel < totalEscalations - 1) {
    body += ` (Escalation ${escalationLevel + 1}/${totalEscalations})`;
  }
  return body;
};


/**
 * Schedules a persistent alert with escalating notifications for an event
 * @param {Object} event - The event object containing alert settings
 * @param {Array<number>} escalationTimes - Array of seconds before event to trigger alerts (optional, overrides event settings)
 */
export const schedulePersistentAlert = async (event, escalationTimes = null) => {
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
    const escalationPattern = escalationTimes || alertSettings.escalationPattern || [0]; // Use provided times, or event settings, or default
    const sound = alertSettings.sound || 'default';
    const vibration = alertSettings.vibration !== undefined ? alertSettings.vibration : true;
    
    // Schedule each notification in the escalation pattern
    const scheduledIds = [];
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
            body: getAlertBody(event, secondsBefore, i, escalationPattern.length),
            sound: sound === 'default' ? undefined : sound,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            sticky: true, // Persistent notification
            data: {
              eventId: event.id,
              notificationType: 'persistent-alert',
              escalationLevel: i,
              totalEscalations: escalationPattern.length,
            },
          },
          trigger: {
            date: triggerDate,
          },
        });
        
        scheduledIds.push(notificationId);
      }
    }
    
    return scheduledIds;
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
    const triggerDate = new Date(eventDate.getTime()); // Trigger at event start
    const now = new Date();

    if (triggerDate > now) {
      const notificationId = `vigil-fullscreen-${event.id}`;

      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: `Vigil Critical: ${event.title}`,
          body: `This critical event is happening now!`,
          sound: sound === 'default' ? undefined : sound,
          priority: Notifications.AndroidNotificationPriority.MAX, // Max priority for full-screen
          sticky: true, // Persistent notification
          data: {
            eventId: event.id,
            notificationType: 'fullscreen-alert',
            isCritical: true,
          },
        },
        trigger: {
          date: triggerDate,
        },
      });
      return notificationId;
    }
    return null;
  } catch (error) {
    console.error('Error scheduling full-screen alert:', error);
    throw error;
  }
};

/**
 * Acknowledges an alert by dismissing the notification and updating event status.
 * @param {string} notificationId - The identifier of the notification to dismiss.
 * @param {string} eventId - The ID of the event associated with the alert.
 */
export const acknowledgeAlert = async (notificationId, eventId) => {
  try {
    await Notifications.dismissNotificationAsync(notificationId);
    await updateEventAcknowledgmentStatus(eventId, 'acknowledged'); // Update event status in DB
    console.log(`Alert acknowledged for event ${eventId}, notification ${notificationId}`);
  } catch (error) {
    console.error(`Error acknowledging alert for event ${eventId}, notification ${notificationId}:`, error);
    throw error;
  }
};

/**
 * Snoozes an alert by dismissing the current notification and scheduling a new one.
 * @param {string} notificationId - The identifier of the notification to dismiss.
 * @param {string} eventId - The ID of the event associated with the alert.
 * @param {number} durationInSeconds - The duration to snooze for, in seconds.
 */
export const snoozeAlert = async (notificationId, eventId, durationInSeconds) => {
  try {
    // 1. Dismiss the current notification
    await Notifications.dismissNotificationAsync(notificationId);
    console.log(`Notification ${notificationId} dismissed for snooze.`);

    // 2. Fetch event details to reschedule
    const event = await getEventById(eventId);
    if (!event) {
      console.warn(`Event ${eventId} not found for snoozing.`);
      return;
    }

    // 3. Schedule a new notification for the snooze duration
    const snoozeTriggerDate = new Date(Date.now() + durationInSeconds * 1000);
    const newNotificationId = `vigil-snooze-${eventId}-${Date.now()}`; // Unique ID for snoozed alert

    await Notifications.scheduleNotificationAsync({
      identifier: newNotificationId,
      content: {
        title: `Vigil Snooze: ${event.title}`,
        body: `Snoozed for ${durationInSeconds / 60} minutes. Will alert again soon.`,
        sound: event.alertSettings?.sound || 'default', // Use event's sound or default
        priority: Notifications.AndroidNotificationPriority.HIGH,
        sticky: true, // Keep it persistent
        data: {
          eventId: event.id,
          notificationType: 'snooze-alert',
          isCritical: event.isCritical, // If original was critical, snooze should also be
        },
      },
      trigger: {
          date: snoozeTriggerDate,
      },
    });

    // 4. Update event status in the database (optional, but good practice)
    await updateEventAcknowledgmentStatus(eventId, 'snoozed', snoozeTriggerDate.toISOString());
    console.log(`Alert snoozed for event ${eventId}. New notification ${newNotificationId} scheduled for ${snoozeTriggerDate.toLocaleString()}.`);

    return newNotificationId;
  } catch (error) {
    console.error(`Error snoozing alert for event ${eventId}, notification ${notificationId}:`, error);
    throw error;
  }
};

/**
 * Dismisses all scheduled notifications related to a specific event.
 * @param {string} eventId - The ID of the event whose notifications should be dismissed.
 */
export const dismissAlert = async (eventId) => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const eventNotifications = scheduled.filter(
      (notification) => notification.content.data && notification.content.data.eventId === eventId
    );

    for (const notification of eventNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
    console.log(`Dismissed all scheduled alerts for event ${eventId}`);
  } catch (error) {
    console.error(`Error dismissing alerts for event ${eventId}:`, error);
    throw error;
  }
};
