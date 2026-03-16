import { useEffect } from 'react';
import { setupNotifications, scheduleDailyNudges } from '../lib/notifications';

export const useNotifications = () => {
  useEffect(() => {
    setupNotifications();
    scheduleDailyNudges();

    // Schedule daily nudges at 8am
    const interval = setInterval(() => {
      scheduleDailyNudges();
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
