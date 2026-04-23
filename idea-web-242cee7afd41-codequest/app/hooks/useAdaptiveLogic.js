import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('cogniquest.db');

const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS performance_history (id INTEGER PRIMARY KEY AUTOINCREMENT, difficulty TEXT, correct INTEGER, total INTEGER, timestamp INTEGER, score REAL, domain TEXT);',
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

export async function savePerformanceRecord(difficulty, correct, total, domain) {
  await initializeDatabase();

  const score = (correct / total) * 100;
  const timestamp = Date.now();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO performance_history (difficulty, correct, total, timestamp, score, domain) VALUES (?, ?, ?, ?, ?, ?);',
        [difficulty, correct, total, timestamp, score, domain],
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

export async function getRecommendedDifficulty(domain) {
  try {
    const history = await getPerformanceHistory();

    if (history.length === 0) {
      return 'easy';
    }

    // Filter by domain if specified
    const domainHistory = domain
      ? history.filter(record => record.domain === domain)
      : history;

    if (domainHistory.length === 0) {
      return 'easy';
    }

    // Calculate weighted average based on recency
    let totalWeight = 0;
    let weightedScore = 0;

    domainHistory.slice(0, 5).forEach((record, index) => {
      const weight = 5 - index; // More recent records have higher weight
      weightedScore += record.score * weight;
      totalWeight += weight;
    });

    const averageScore = weightedScore / totalWeight;
    const lastDifficulty = domainHistory[0].difficulty;

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
        },
        domainDistribution: {
          logic: 0,
          math: 0,
          verbal: 0
        },
        recentPerformance: []
      };
    }

    const totalSessions = history.length;
    const totalScore = history.reduce((sum, record) => sum + record.score, 0);
    const averageScore = totalScore / totalSessions;

    const difficultyDistribution = history.reduce((acc, record) => {
      acc[record.difficulty] = (acc[record.difficulty] || 0) + 1;
      return acc;
    }, { easy: 0, medium: 0, hard: 0 });

    const domainDistribution = history.reduce((acc, record) => {
      acc[record.domain] = (acc[record.domain] || 0) + 1;
      return acc;
    }, { logic: 0, math: 0, verbal: 0 });

    // Get recent performance for charting
    const recentPerformance = history.slice(0, 7).reverse().map(record => ({
      date: new Date(record.timestamp).toLocaleDateString(),
      score: record.score,
      domain: record.domain
    }));

    return {
      totalSessions,
      averageScore,
      difficultyDistribution,
      domainDistribution,
      recentPerformance
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
      },
      domainDistribution: {
        logic: 0,
        math: 0,
        verbal: 0
      },
      recentPerformance: []
    };
  }
}

export async function getProblemRecommendations() {
  try {
    const stats = await getPerformanceStats();

    // Determine which domain to focus on
    const domains = ['logic', 'math', 'verbal'];
    let targetDomain = domains[0];

    // Find domain with lowest performance
    if (stats.domainDistribution) {
      const minCount = Math.min(
        stats.domainDistribution.logic || 0,
        stats.domainDistribution.math || 0,
        stats.domainDistribution.verbal || 0
      );

      targetDomain = domains.find(domain =>
        (stats.domainDistribution[domain] || 0) === minCount
      ) || domains[0];
    }

    const recommendedDifficulty = await getRecommendedDifficulty(targetDomain);

    // Adjust based on recent performance trends
    if (stats.recentPerformance.length >= 3) {
      const lastThreeScores = stats.recentPerformance.slice(-3).map(p => p.score);
      const isImproving = lastThreeScores[2] < lastThreeScores[1] && lastThreeScores[1] < lastThreeScores[0];

      if (isImproving) {
        // If user is improving, slightly increase difficulty
        const difficultyLevels = ['easy', 'medium', 'hard'];
        const currentIndex = difficultyLevels.indexOf(recommendedDifficulty);
        if (currentIndex < difficultyLevels.length - 1) {
          return {
            domain: targetDomain,
            difficulty: difficultyLevels[currentIndex + 1]
          };
        }
      }
    }

    return {
      domain: targetDomain,
      difficulty: recommendedDifficulty
    };
  } catch (error) {
    console.error('Error getting problem recommendations:', error);
    return {
      domain: 'logic',
      difficulty: 'easy'
    };
  }
}
