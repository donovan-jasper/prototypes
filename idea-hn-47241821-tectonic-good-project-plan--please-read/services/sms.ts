import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { getCurrentLocation } from './location';
import { initDatabase } from './database';

const TWILIO_BACKEND_URL = 'https://your-twilio-backend-url.com/send-sms';
const BACKGROUND_TASK_NAME = 'safety-checkin-task';

interface TrustedContact {
  id: string;
  phoneNumber: string;
  name: string;
}

interface SafetyCheckIn {
  id: string;
  timerDuration: number;
  message: string;
  contacts: TrustedContact[];
  createdAt: Date;
}

interface OfflineMessage {
  to: string;
  body: string;
  timestamp: string;
}

export const setupBackgroundTask = async () => {
  try {
    await TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }) => {
      if (error) {
        console.error('Background task error:', error);
        return;
      }

      const { checkInId } = data as { checkInId: string };
      await handleSafetyCheckInExpiration(checkInId);
    });

    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('Background task registered successfully');
  } catch (error) {
    console.error('Error setting up background task:', error);
  }
};

export const scheduleSafetyCheckIn = async (checkIn: SafetyCheckIn) => {
  try {
    const db = await initDatabase();

    // Store check-in in database
    await db.runAsync(
      'INSERT INTO check_ins (id, timer_duration, message, contacts, created_at) VALUES (?, ?, ?, ?, ?)',
      [
        checkIn.id,
        checkIn.timerDuration,
        checkIn.message,
        JSON.stringify(checkIn.contacts),
        checkIn.createdAt.toISOString()
      ]
    );

    // Schedule background task
    await BackgroundFetch.setTask(BACKGROUND_TASK_NAME, {
      checkInId: checkIn.id,
      expirationTime: Date.now() + checkIn.timerDuration * 60 * 1000,
    });

    // Schedule local notification reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Safety Check-In Reminder',
        body: 'Your safety check-in timer is active. Tap to check in now.',
        sound: 'default',
      },
      trigger: {
        seconds: checkIn.timerDuration * 60,
      },
    });

    return checkIn;
  } catch (error) {
    console.error('Error scheduling safety check-in:', error);
    throw error;
  }
};

export const cancelSafetyCheckIn = async () => {
  try {
    const db = await initDatabase();

    // Get the active check-in
    const activeCheckIn = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM check_ins ORDER BY created_at DESC LIMIT 1'
    );

    if (activeCheckIn) {
      // Delete the check-in from database
      await db.runAsync('DELETE FROM check_ins WHERE id = ?', [activeCheckIn.id]);

      // Cancel any scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Cancel background task
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
    }

    return true;
  } catch (error) {
    console.error('Error canceling safety check-in:', error);
    throw error;
  }
};

export const handleSafetyCheckInExpiration = async (checkInId: string) => {
  try {
    const db = await initDatabase();

    // Get check-in details
    const checkIn = await db.getFirstAsync<{
      id: string;
      timer_duration: number;
      message: string;
      contacts: string;
      created_at: string;
    }>(
      'SELECT * FROM check_ins WHERE id = ?',
      [checkInId]
    );

    if (!checkIn) {
      throw new Error('Check-in not found');
    }

    const contacts: TrustedContact[] = JSON.parse(checkIn.contacts);

    // Get current location
    const location = await getCurrentLocation();
    const locationText = `My location: ${location.latitude}, ${location.longitude}`;

    // Send SMS to all contacts
    for (const contact of contacts) {
      try {
        await sendSMS(contact.phoneNumber, `${checkIn.message}\n\n${locationText}`);
      } catch (error) {
        console.error(`Failed to send SMS to ${contact.phoneNumber}:`, error);
        // Store message for later retry
        await storeOfflineMessage({
          to: contact.phoneNumber,
          body: `${checkIn.message}\n\n${locationText}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Clean up check-in
    await db.runAsync('DELETE FROM check_ins WHERE id = ?', [checkInId]);

    // Send completion notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Safety Check-In Completed',
        body: 'Your location has been shared with trusted contacts.',
        sound: 'default',
      },
      trigger: null,
    });

  } catch (error) {
    console.error('Error handling safety check-in expiration:', error);
    throw error;
  }
};

export const sendSMS = async (to: string, body: string) => {
  try {
    const response = await axios.post(TWILIO_BACKEND_URL, {
      to,
      body,
    });

    if (response.data.success) {
      return true;
    } else {
      throw new Error(response.data.message || 'Failed to send SMS');
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

export const storeOfflineMessage = async (message: OfflineMessage) => {
  try {
    const db = await initDatabase();
    await db.runAsync(
      'INSERT INTO offline_messages (to_phone, body, timestamp) VALUES (?, ?, ?)',
      [message.to, message.body, message.timestamp]
    );
  } catch (error) {
    console.error('Error storing offline message:', error);
    throw error;
  }
};

export const processOfflineMessages = async () => {
  try {
    const db = await initDatabase();

    // Get all offline messages
    const messages = await db.getAllAsync<{
      id: number;
      to_phone: string;
      body: string;
      timestamp: string;
    }>('SELECT * FROM offline_messages');

    // Try to send each message
    for (const message of messages) {
      try {
        await sendSMS(message.to_phone, message.body);
        // If successful, delete the message
        await db.runAsync('DELETE FROM offline_messages WHERE id = ?', [message.id]);
      } catch (error) {
        console.error(`Failed to send offline message to ${message.to_phone}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing offline messages:', error);
  }
};
