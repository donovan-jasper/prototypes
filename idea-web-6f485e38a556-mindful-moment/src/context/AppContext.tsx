import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { useMoments } from '../hooks/useMoments';
import { useStreak } from '../hooks/useStreak';
import { NotificationService } from '../services/notifications';

interface AppContextType {
  userId: string;
  moments: any[];
  streak: number;
  loading: boolean;
  error: Error | null;
  completeMoment: (momentId: string, moodRating?: number) => Promise<void>;
  refreshMoments: () => Promise<void>;
  notificationService: NotificationService;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId] = useState('user1'); // In a real app, this would come from auth
  const db = useDatabase();
  const { moments, loading, error, completeMoment, refreshMoments } = useMoments(userId);
  const { streak } = useStreak(userId);
  const [notificationService] = useState(new NotificationService(userId));

  // Initialize notifications on app start
  useEffect(() => {
    const initializeNotifications = async () => {
      const hasPermission = await notificationService.getNotificationPermissions();
      if (!hasPermission) {
        await notificationService.requestNotificationPermissions();
      }

      // Schedule today's notifications
      await notificationService.scheduleDailyNotifications();
    };

    initializeNotifications();
  }, [notificationService]);

  return (
    <AppContext.Provider
      value={{
        userId,
        moments,
        streak,
        loading,
        error,
        completeMoment,
        refreshMoments,
        notificationService
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
