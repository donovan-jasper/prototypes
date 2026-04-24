import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useStore } from '../../store/useStore';
import WordCard from '../../components/WordCard';
import StreakCounter from '../../components/StreakCounter';
import { getDueWords, updateProgress } from '../../lib/database';
import { calculateNextReview, updateCardState } from '../../lib/fsrs';
import * as Haptics from 'expo-haptics';

export default function DailyPractice() {
  const {
    incrementStreak,
    markWordReviewed,
    dailyQueue,
    currentWord,
    loadDailyQueue,
    loadTotalWordsLearned
  } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await loadDailyQueue();
        await loadTotalWordsLearned();
      } catch (error) {
        console.error('Error loading daily queue:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const handleSwipe = async (direction: 'correct' | 'learning' | 'forgot') => {
    if (!currentWord) return;

    try {
      await markWordReviewed(currentWord.id, direction);
      setCompletedCount(prev => prev + 1);

      // Play haptic feedback
      await Haptics.notificationAsync(
        direction === 'correct' ? Haptics.NotificationFeedbackType.Success :
        direction === 'learning' ? Haptics.NotificationFeedbackType.Warning :
        Haptics.NotificationFeedbackType.Error
      );

      if (dailyQueue.length === 0) {
        incrementStreak();
      }
    } catch (error) {
      console.error('Error handling swipe:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Loading your daily words...</Text>
      </View>
    );
  }

  if (dailyQueue.length === 0 && completedCount === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptyText}>No words due for review right now.</Text>
        <Text style={styles.emptySubtext}>Come back tomorrow for more practice.</Text>
      </View>
    );
  }

  if (dailyQueue.length === 0 && completedCount > 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.completeTitle}>Great work!</Text>
        <Text style={styles.completeText}>You've completed today's practice.</Text>
        <StreakCounter />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StreakCounter />
        <Text style={styles.progressText}>
          {completedCount + 1} / {completedCount + dailyQueue.length}
        </Text>
      </View>
      {currentWord && (
        <WordCard
          word={currentWord}
          onSwipe={handleSwipe}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 15,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 10,
  },
  completeText: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 20,
  },
});
