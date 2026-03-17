import * as Notifications from 'expo-notifications';
import { logAdherence } from '../database/medications';

export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleMedicationReminder = async (medication) => {
  const times = medication.schedule.split(',').map(t => t.trim());
  const notificationIds = [];

  for (const time of times) {
    const [hour, minute] = time.split(':').map(num => parseInt(num));
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to take ${medication.name}`,
        body: `Dosage: ${medication.dosage}`,
        data: { medicationId: medication.id },
        categoryIdentifier: 'medication',
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
    
    notificationIds.push(notificationId);
  }

  return notificationIds;
};

export const cancelReminder = async (notificationId) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const snoozeReminder = async (medicationId, minutes) => {
  const medication = await import('../database/medications').then(m => m.getMedicationById(medicationId));
  
  const trigger = new Date();
  trigger.setMinutes(trigger.getMinutes() + minutes);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to take ${medication.name}`,
      body: `Dosage: ${medication.dosage}`,
      data: { medicationId: medication.id },
      categoryIdentifier: 'medication',
    },
    trigger,
  });
};

export const registerNotificationHandlers = () => {
  Notifications.setNotificationCategoryAsync('medication', [
    {
      identifier: 'take',
      buttonTitle: 'Take Now',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'skip',
      buttonTitle: 'Skip',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'snooze',
      buttonTitle: 'Snooze 15min',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);

  const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
    const { medicationId } = response.notification.request.content.data;
    const actionIdentifier = response.actionIdentifier;

    if (actionIdentifier === 'take' || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      await logAdherence(medicationId, 'taken', new Date().toISOString());
    } else if (actionIdentifier === 'skip') {
      await logAdherence(medicationId, 'skipped', new Date().toISOString());
    } else if (actionIdentifier === 'snooze') {
      await snoozeReminder(medicationId, 15);
      await logAdherence(medicationId, 'snoozed', new Date().toISOString());
    }
  });

  return subscription;
};
