import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { initDatabase, addSymptom, getSymptomsByDateRange, addCycle, getFavoriteExercises as dbGetFavoriteExercises, addReliefSession, getReliefSessions as dbGetReliefSessions } from '../services/database';

export const useDatabase = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeDb = async () => {
      try {
        const database = await initDatabase();
        setDb(database);
        setIsReady(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };

    initializeDb();

    return () => {
      if (db) {
        db.closeAsync();
      }
    };
  }, []);

  const addNewSymptom = async (symptomData: any) => {
    if (!db) throw new Error('Database not initialized');
    return await addSymptom(db, symptomData);
  };

  const getSymptoms = async (startDate: Date, endDate: Date) => {
    if (!db) throw new Error('Database not initialized');
    return await getSymptomsByDateRange(db, startDate, endDate);
  };

  const addNewCycle = async (cycleData: any) => {
    if (!db) throw new Error('Database not initialized');
    return await addCycle(db, cycleData);
  };

  const getFavoriteExercises = async () => {
    if (!db) throw new Error('Database not initialized');
    return await dbGetFavoriteExercises(db);
  };

  const logReliefSession = async (sessionData: any) => {
    if (!db) throw new Error('Database not initialized');
    return await addReliefSession(db, sessionData);
  };

  const getReliefSessions = async (exerciseId: number) => {
    if (!db) throw new Error('Database not initialized');
    return await dbGetReliefSessions(db, exerciseId);
  };

  return {
    db,
    isReady,
    addNewSymptom,
    getSymptoms,
    addNewCycle,
    getFavoriteExercises,
    logReliefSession,
    getReliefSessions,
  };
};
