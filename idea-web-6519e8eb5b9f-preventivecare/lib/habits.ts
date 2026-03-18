import { getDatabase } from './database';

export const addHabit = async (name, icon, frequency) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT INTO habits (name, icon, frequency) VALUES (?, ?, ?);',
          [name, icon, frequency],
          (_, { insertId }) => {
            resolve({ id: insertId, name, icon, frequency });
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const getHabits = async (userId = 1) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM habits WHERE user_id = ?;',
          [userId],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const logHabitCompletion = async (habitId, date, value = null) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT INTO habit_logs (habit_id, date, completed, value) VALUES (?, ?, ?, ?);',
          [habitId, date.toISOString(), true, value],
          (_, { insertId }) => {
            resolve({ id: insertId, habitId, date, completed: true, value });
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const getHabitLogs = async (habitId, startDate, endDate) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM habit_logs WHERE habit_id = ? AND date BETWEEN ? AND ?;',
          [habitId, startDate.toISOString(), endDate.toISOString()],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const getHabitLogsForToday = async (habitId) => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM habit_logs WHERE habit_id = ? AND date(date) = date("now");',
          [habitId],
          (_, { rows: { _array } }) => {
            resolve(_array.length > 0);
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const calculateStreak = async (habitId) => {
  const logs = await getHabitLogs(habitId, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === today.getTime() - i * 24 * 60 * 60 * 1000 && logs[i].completed) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
