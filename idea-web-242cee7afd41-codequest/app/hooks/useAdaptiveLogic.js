import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('cogniquest.db');

const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS performance_history (id INTEGER PRIMARY KEY AUTOINCREMENT, difficulty TEXT, correct INTEGER, total INTEGER, timestamp INTEGER, score REAL);',
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export async function getPerformanceHistory() {
  await initializeDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM performance_history ORDER BY timestamp DESC LIMIT 20;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
}

export async function savePerformanceRecord(difficulty, correct, total) {
  await initializeDatabase();

  const score = (correct / total) * 100;
  const timestamp = Date.now();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO performance_history (difficulty, correct, total, timestamp, score) VALUES (?, ?, ?, ?, ?);',
        [difficulty, correct, total, timestamp, score],
        () => {
          // After insert, get the updated history
          tx.executeSql(
            'SELECT * FROM performance_history ORDER BY timestamp DESC LIMIT 20;',
            [],
            (_, { rows: { _array } }) => resolve(_array),
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
}

export function calculateAdaptiveDifficulty(performanceScore, currentDifficulty) {
  const difficultyLevels = ['easy', 'medium', 'hard'];
  const currentIndex = difficultyLevels.indexOf(currentDifficulty);

  if (performanceScore >= 80 && currentIndex < difficultyLevels.length - 1) {
    return difficultyLevels[currentIndex + 1];
  }

  if (performanceScore < 40 && currentIndex > 0) {
    return difficultyLevels[currentIndex - 1];
  }

  return currentDifficulty;
}

export async function getRecommendedDifficulty() {
  try {
    const history = await getPerformanceHistory();

    if (history.length === 0) {
      return 'easy';
    }

    const recentSessions = history.slice(0, 5);
    const averageScore = recentSessions.reduce((sum, record) => sum + record.score, 0) / recentSessions.length;
    const lastDifficulty = recentSessions[0].difficulty;

    return calculateAdaptiveDifficulty(averageScore, lastDifficulty);
  } catch (error) {
    console.error('Error calculating recommended difficulty:', error);
    return 'easy';
  }
}

export async function getPerformanceStats() {
  try {
    const history = await getPerformanceHistory();

    if (history.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        difficultyDistribution: {
          easy: 0,
          medium: 0,
          hard: 0
        }
      };
    }

    const totalSessions = history.length;
    const totalScore = history.reduce((sum, record) => sum + record.score, 0);
    const averageScore = totalScore / totalSessions;

    const difficultyDistribution = history.reduce((acc, record) => {
      acc[record.difficulty] = (acc[record.difficulty] || 0) + 1;
      return acc;
    }, { easy: 0, medium: 0, hard: 0 });

    return {
      totalSessions,
      averageScore,
      difficultyDistribution
    };
  } catch (error) {
    console.error('Error calculating performance stats:', error);
    return {
      totalSessions: 0,
      averageScore: 0,
      difficultyDistribution: {
        easy: 0,
        medium: 0,
        hard: 0
      }
    };
  }
}
