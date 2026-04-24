import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    notificationsEnabled: true,
    criticalAlertsEnabled: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem('notificationsEnabled');
        const storedCriticalAlerts = await AsyncStorage.getItem('criticalAlertsEnabled');

        if (storedNotifications !== null) {
          setNotificationSettings(prev => ({
            ...prev,
            notificationsEnabled: JSON.parse(storedNotifications),
          }));
        }

        if (storedCriticalAlerts !== null) {
          setNotificationSettings(prev => ({
            ...prev,
            criticalAlertsEnabled: JSON.parse(storedCriticalAlerts),
          }));
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    };

    loadSettings();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      if (notificationSettings.notificationsEnabled) {
        setAlerts(prevAlerts => [...prevAlerts, notification]);
      }
    });

    return () => subscription.remove();
  }, [notificationSettings]);

  const scheduleAlert = (title, body, isCritical = false) => {
    if (!notificationSettings.notificationsEnabled) return;
    if (isCritical && !notificationSettings.criticalAlertsEnabled) return;

    Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: isCritical ? 'default' : undefined,
        priority: isCritical ? 'high' : 'default',
      },
      trigger: null,
    });
  };

  return { alerts, scheduleAlert, setNotificationSettings };
};

export default useAlerts;
