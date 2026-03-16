import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Audio } from 'expo-av';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('Background notification task error:', error);
    return;
  }

  if (data) {
    const { notification } = data as { notification: Notifications.Notification };
    const audioFile = notification.request.content.data.audioFile;

    if (audioFile) {
      playAudioInBackground(audioFile);
    }
  }
});

const playAudioInBackground = async (audioFile: string) => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require(`../assets/voices/${audioFile}`),
      { shouldPlay: true }
    );
    await sound.playAsync();
  } catch (error) {
    console.error('Error playing audio in background:', error);
  }
};

export const scheduleVoicePrompt = async (prompt: {
  title: string;
  body: string;
  audioFile: string;
  trigger: { hour: number; minute: number };
}) => {
  const { title, body, audioFile, trigger } = prompt;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'notification.wav',
      data: { audioFile },
    },
    trigger: {
      hour: trigger.hour,
      minute: trigger.minute,
      repeats: true,
    },
  });

  return notificationId;
};

export const cancelAllPrompts = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const getScheduledPrompts = async () => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications.map((notification) => ({
    id: notification.identifier,
    title: notification.content.title,
    body: notification.content.body,
    audioFile: notification.content.data.audioFile,
    trigger: notification.trigger as { hour: number; minute: number },
  }));
};

export const updatePromptSchedule = async (promptId: string, updates: Partial<{
  title: string;
  body: string;
  audioFile: string;
  trigger: { hour: number; minute: number };
}>) => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  const notification = notifications.find((n) => n.identifier === promptId);

  if (notification) {
    await Notifications.cancelScheduledNotificationAsync(promptId);

    const updatedNotification = {
      content: {
        ...notification.content,
        ...updates,
      },
      trigger: updates.trigger || notification.trigger,
    };

    await Notifications.scheduleNotificationAsync(updatedNotification);
  }
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.error('Notification permissions not granted');
  }

  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'notification.wav',
  });

  await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
};
