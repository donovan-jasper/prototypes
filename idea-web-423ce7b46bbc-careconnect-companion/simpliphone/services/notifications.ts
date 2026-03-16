import * as Notifications from 'expo-notifications';

export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleMedicationReminder = async (medication) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to take ${medication.name}`,
      body: `Dosage: ${medication.dosage}`,
      data: { medicationId: medication.id },
    },
    trigger: {
      hour: parseInt(medication.schedule.split(':')[0]),
      minute: parseInt(medication.schedule.split(':')[1]),
      repeats: true,
    },
  });
};

export const cancelReminder = async (notificationId) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const handleNotificationResponse = async (response) => {
  const { medicationId } = response.notification.request.content.data;
  // Handle medication taken
};
