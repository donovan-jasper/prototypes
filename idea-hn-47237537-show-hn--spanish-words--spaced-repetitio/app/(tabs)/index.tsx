import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../../store/useStore';
import WordCard from '../../components/WordCard';
import StreakCounter from '../../components/StreakCounter';
import { getDueWords } from '../../lib/database';

export default function DailyPractice() {
  const { dailyQueue, loadDailyQueue, markWordReviewed, incrementStreak } = useStore();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    loadDailyQueue();
  }, []);

  const handleSwipe = async (direction: 'correct' | 'learning' | 'forgot') => {
    if (currentWordIndex < dailyQueue.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      incrementStreak();
      // Load new daily queue
      await loadDailyQueue();
      setCurrentWordIndex(0);
    }
    markWordReviewed(dailyQueue[currentWordIndex].id, direction);
  };

  if (dailyQueue.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your daily words...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StreakCounter />
      <WordCard
        word={dailyQueue[currentWordIndex]}
        onSwipe={handleSwipe}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#6B7280',
  },
});
