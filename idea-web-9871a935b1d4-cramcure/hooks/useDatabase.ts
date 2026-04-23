import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { initDatabase, addSymptom, getSymptomsByDateRange, addCycle, getFavoriteExercises as dbGetFavoriteExercises } from '../services/database';

export const useDatabase = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    const initializeDb = async () => {
      const database = await initDatabase();
      setDb(database);
    };

    initializeDb();
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

  return {
    db,
    addNewSymptom,
    getSymptoms,
    addNewCycle,
    getFavoriteExercises,
  };
};
