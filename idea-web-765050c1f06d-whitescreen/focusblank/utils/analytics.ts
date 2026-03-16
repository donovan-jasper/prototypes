import { openDatabase } from './database';

const trackScreenTime = async (date, seconds) => {
  const db = await openDatabase();
  await db.runAsync('INSERT INTO screen_time (date, seconds) VALUES (?, ?)', [date, seconds]);
};

const getDailyUsage = async (date) => {
  const db = await openDatabase();
  const result = await db.getFirstAsync('SELECT SUM(seconds) as total FROM screen_time WHERE date = ?', [date]);
  return result.total || 0;
};

export { trackScreenTime, getDailyUsage };
