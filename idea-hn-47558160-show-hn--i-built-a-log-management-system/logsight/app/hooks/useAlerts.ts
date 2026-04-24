import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setAlerts(prevAlerts => [...prevAlerts, notification]);
    });

    return () => subscription.remove();
  }, []);

  const scheduleAlert = (title, body) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  };

  return { alerts, scheduleAlert };
};

export default useAlerts;
