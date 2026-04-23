import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { getUnreadRecallAlertCount, markRecallAlertAsRead } from '@/services/database';
import { router } from 'expo-router';

export const useRecallAlerts = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Load initial unread count
  useEffect(() => {
    const loadUnreadCount = async () => {
      const count = await getUnreadRecallAlertCount();
      setUnreadCount(count);
    };

    loadUnreadCount();

    // Set up notification listener to update count when new notifications arrive
    const subscription = Notifications.addNotificationReceivedListener(async () => {
      const count = await getUnreadRecallAlertCount();
      setUnreadCount(count);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle notification taps
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { establishmentId, alertId } = response.notification.request.content.data;

      if (establishmentId) {
        // Mark alert as read
        if (alertId) {
          markRecallAlertAsRead(alertId);
          setUnreadCount(prev => Math.max(0, prev - 1));
        }

        // Navigate to establishment detail
        router.push({
          pathname: '/establishment/[id]',
          params: { id: establishmentId }
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    unreadCount,
    markAllAsRead: async () => {
      // In a real app, you would implement this to mark all alerts as read
      // For now, we'll just reset the count to 0
      setUnreadCount(0);
    }
  };
};
