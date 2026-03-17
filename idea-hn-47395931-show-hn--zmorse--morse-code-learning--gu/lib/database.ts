import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('morsemate.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS streaks (
      id INTEGER PRIMARY KEY,
      current INTEGER DEFAULT 0,
      longest INTEGER DEFAULT 0,
      last_completed TEXT
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      word TEXT,
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS custom_sos (
      id INTEGER PRIMARY KEY,
      message TEXT NOT NULL
    );

    INSERT OR IGNORE INTO streaks (id, current, longest) VALUES (1, 0, 0);
    INSERT OR IGNORE INTO custom_sos (id, message) VALUES (1, 'SOS');
  `);
}

export async function getStreak() {
  const result = db.getFirstSync('SELECT * FROM streaks WHERE id = 1');
  return result || { current: 0, longest: 0, last_completed: null };
}

export async function updateStreak(date: Date) {
  const streak = await getStreak();
  const lastDate = streak.last_completed ? new Date(streak.last_completed) : null;
  const daysDiff = lastDate
    ? Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  let newCurrent = daysDiff === 1 ? streak.current + 1 : 1;
  let newLongest = Math.max(newCurrent, streak.longest);

  db.runSync(
    'UPDATE streaks SET current = ?, longest = ?, last_completed = ? WHERE id = 1',
    [newCurrent, newLongest, date.toISOString()]
  );
}

export async function resetStreak() {
  db.runSync('UPDATE streaks SET current = 0, last_completed = NULL WHERE id = 1');
}

export async function getCustomSOSMessage() {
  const result = db.getFirstSync('SELECT message FROM custom_sos WHERE id = 1');
  return result ? result.message : 'SOS';
}

export async function setCustomSOSMessage(message: string) {
  db.runSync(
    'INSERT OR REPLACE INTO custom_sos (id, message) VALUES (1, ?)',
    [message]
  );
}
