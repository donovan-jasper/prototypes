import { useEffect, useState } from 'react';
import * as database from '../services/database';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await database.initializeDatabase();
      setIsReady(true);
    };

    initialize();
  }, []);

  return {
    isReady,
    getOrCreateUser: database.getOrCreateUser,
    getAllMoments: database.getAllMoments,
    getRandomMoment: database.getRandomMoment,
    completeMoment: database.completeMoment,
    getUserSettings: database.getUserSettings,
    updateUserSettings: database.updateUserSettings,
    getUserPatterns: database.getUserPatterns,
    logIgnoredNotification: database.logIgnoredNotification,
    logEngagedNotification: database.logEngagedNotification,
    scheduleNotification: database.scheduleNotification,
    getScheduledMomentsForToday: database.getScheduledMomentsForToday,
    createCustomMoment: database.createCustomMoment,
    getCompletedMoments: database.getCompletedMoments,
    getDailyAnalytics: database.getDailyAnalytics,
    getAnalyticsBetweenDates: database.getAnalyticsBetweenDates,
    updateUser: database.updateUser,
  };
}
