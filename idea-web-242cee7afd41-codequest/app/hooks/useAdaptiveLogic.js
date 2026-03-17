import AsyncStorage from '@react-native-async-storage/async-storage';

const PERFORMANCE_HISTORY_KEY = '@cogniquest_performance_history';
const MAX_HISTORY_LENGTH = 20;

export async function getPerformanceHistory() {
  try {
    const history = await AsyncStorage.getItem(PERFORMANCE_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading performance history:', error);
    return [];
  }
}

export async function savePerformanceRecord(difficulty, correct, total) {
  try {
    const history = await getPerformanceHistory();
    const newRecord = {
      difficulty,
      correct,
      total,
      timestamp: Date.now(),
      score: (correct / total) * 100
    };
    
    const updatedHistory = [newRecord, ...history].slice(0, MAX_HISTORY_LENGTH);
    await AsyncStorage.setItem(PERFORMANCE_HISTORY_KEY, JSON.stringify(updatedHistory));
    
    return updatedHistory;
  } catch (error) {
    console.error('Error saving performance record:', error);
    return [];
  }
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
