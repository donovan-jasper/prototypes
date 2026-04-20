import { useEffect, useState, useRef } from 'react';
import * as database from '../services/database';

export function useDatabase() {
  const dbRef = useRef<any>(null);

  useEffect(() => {
    const initialize = async () => {
      dbRef.current = await database.initializeDatabase();
    };

    initialize();
  }, []);

  const db = dbRef.current;

  return {
    db,
    getOrCreateUser: db ? database.getOrCreateUser : () => null,
    getAllMoments: db ? database.getAllMoments : () => null,
    getRandomMoment: db ? database.getRandomMoment : () => null,
    completeMoment: db ? database.completeMoment : () => null,
    getUserSettings: db ? database.getUserSettings : () => null,
    updateUserSettings: db ? database.updateUserSettings : () => null,
    getUserPatterns: db ? database.getUserPatterns : () => null,
    logIgnoredNotification: db ? database.logIgnoredNotification : () => null,
    logEngagedNotification: db ? database.logEngagedNotification : () => null,
    scheduleNotification: db ? database.scheduleNotification : () => null,
    getScheduledMomentsForToday: db ? database.getScheduledMomentsForToday : () => null,
    createCustomMoment: db ? database.createCustomMoment : () => null,
    getCompletedMoments: db ? database.getCompletedMoments : () => null,
    getDailyAnalytics: db ? database.getDailyAnalytics : () => null,
    getAnalyticsBetweenDates: db ? database.getAnalyticsBetweenDates : () => null,
    updateUser: db ? database.updateUser : () => null,
  };
}
