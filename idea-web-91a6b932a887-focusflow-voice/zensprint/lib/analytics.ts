import { format, parseISO } from 'date-fns';

export const calculateTotalFocusTime = (sessions: any[]) => {
  return sessions
    .filter((session) => session.completed)
    .reduce((total, session) => total + session.duration, 0);
};

export const getMostProductiveHour = (sessions: any[]) => {
  const hours = sessions
    .filter((session) => session.completed)
    .map((session) => parseISO(session.startTime).getHours());

  const hourCounts = hours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(hourCounts).reduce((a, b) => (a[1] > b[1] ? a : b), [0, 0])[0];
};

export const getCompletionRate = (sessions: any[]) => {
  const completed = sessions.filter((session) => session.completed).length;
  return Math.round((completed / sessions.length) * 100);
};

export const exportToCSV = (sessions: any[]) => {
  const headers = ['ID', 'Duration', 'Start Time', 'End Time', 'Completed', 'Voice Pack'];
  const rows = sessions.map((session) => [
    session.id,
    session.duration,
    session.startTime,
    session.endTime || '',
    session.completed ? 'Yes' : 'No',
    session.voicePack,
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach((row) => {
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
};

export const getWeeklyStats = (sessions: any[]) => {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklySessions = sessions.filter((session) => {
    const sessionDate = parseISO(session.startTime);
    return sessionDate >= weekAgo && sessionDate <= today;
  });

  return {
    totalFocusTime: calculateTotalFocusTime(weeklySessions),
    mostProductiveHour: getMostProductiveHour(weeklySessions),
    completionRate: getCompletionRate(weeklySessions),
  };
};
