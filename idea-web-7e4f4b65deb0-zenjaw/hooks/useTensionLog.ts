import { useState, useEffect, useCallback } from 'react';
import { openDatabase, createTables, logTension as dbLogTension, getTensionHistory, getRecentTensionLogs } from '@/services/database';
import { TensionLog, BodyZone, TensionStatus } from '@/types';
import * as Haptics from 'expo-haptics';

export function useTensionLog() {
  const [logs, setLogs] = useState<TensionLog[]>([]);
  const [recentLogs, setRecentLogs] = useState<TensionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      const db = openDatabase();
      await createTables(db);
      await loadRecentLogs();
      await loadLogs();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const db = openDatabase();
      const history = await getTensionHistory(db, 7);
      setLogs(history);
    } catch (error) {
      console.error('Failed to load tension history:', error);
    }
  };

  const loadRecentLogs = async () => {
    try {
      const db = openDatabase();
      const recent = await getRecentTensionLogs(db, 5);
      setRecentLogs(recent);
    } catch (error) {
      console.error('Failed to load recent logs:', error);
    }
  };

  const logTension = useCallback(async (bodyZone: BodyZone, status: TensionStatus) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const db = openDatabase();
      const newLog = await dbLogTension(db, bodyZone, status, new Date());
      await loadRecentLogs();
      await loadLogs();
      return newLog;
    } catch (error) {
      console.error('Failed to log tension:', error);
      throw error;
    }
  }, []);

  const calculateTensionScore = useCallback((logsList: TensionLog[]): number => {
    if (logsList.length === 0) return 0;
    const tenseCount = logsList.filter(log => log.status === 'tense').length;
    return tenseCount / logsList.length;
  }, []);

  const identifyPatterns = useCallback((logsList: TensionLog[]) => {
    const hourCounts: { [hour: number]: number } = {};
    
    logsList.forEach(log => {
      if (log.status === 'tense') {
        const date = new Date(log.timestamp);
        const hour = date.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return { peakHours };
  }, []);

  return {
    logs,
    recentLogs,
    loading,
    logTension,
    calculateTensionScore,
    identifyPatterns,
    refresh: loadLogs,
  };
}
