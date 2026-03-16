import { Session } from '../types';

export const formatDuration = (startTime: number, endTime: number): string => {
  const duration = (endTime - startTime) / 1000; // Convert to seconds
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const getWeeklyStats = (sessions: Session[]): { totalSessions: number; totalDuration: number } => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklySessions = sessions.filter(session => new Date(session.startTime) >= sevenDaysAgo);
  const totalDuration = weeklySessions.reduce((sum, session) => sum + (session.endTime - session.startTime), 0);

  return {
    totalSessions: weeklySessions.length,
    totalDuration,
  };
};
