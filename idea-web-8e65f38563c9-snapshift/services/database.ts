import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('voicevault.db');

export const openDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS goals (
            id TEXT PRIMARY KEY,
            title TEXT,
            completed INTEGER,
            createdAt INTEGER
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS streak (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            currentStreak INTEGER,
            lastCheckIn INTEGER
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS prompts (
            id TEXT PRIMARY KEY,
            title TEXT,
            time TEXT,
            enabled INTEGER,
            clipId TEXT
          );`
        );
      },
      (error) => reject(error),
      () => resolve(db)
    );
  });
};

export const createGoal = async (title: string) => {
  return new Promise((resolve, reject) => {
    const id = Date.now().toString();
    const createdAt = Date.now();

    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO goals (id, title, completed, createdAt) VALUES (?, ?, ?, ?);',
          [id, title, 0, createdAt],
          (_, result) => {
            resolve({ id, title, completed: false, createdAt });
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getGoals = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM goals;',
          [],
          (_, { rows }) => {
            const goals = rows._array.map((goal) => ({
              ...goal,
              completed: Boolean(goal.completed),
            }));
            resolve(goals);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateGoalStatus = async (id: string, completed: boolean) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE goals SET completed = ? WHERE id = ?;',
          [completed ? 1 : 0, id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteGoal = async (id: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM goals WHERE id = ?;',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getStreak = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT currentStreak FROM streak ORDER BY id DESC LIMIT 1;',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0).currentStreak);
            } else {
              resolve(0);
            }
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateStreak = async (streak: number, date: Date) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO streak (currentStreak, lastCheckIn) VALUES (?, ?);',
          [streak, date.getTime()],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getLastCheckIn = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT lastCheckIn FROM streak ORDER BY id DESC LIMIT 1;',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(new Date(rows.item(0).lastCheckIn));
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};
