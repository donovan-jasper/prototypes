import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useStore } from '../../store/useStore';
import WordCard from '../../components/WordCard';
import StreakCounter from '../../components/StreakCounter';
import { getDueWords, updateProgress } from '../../lib/database';
import { calculateNextReview, updateCardState } from '../../lib/fsrs';

export default function DailyPractice() {
  const { incrementStreak } = useStore();
  const [dailyQueue, setDailyQueue] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadDailyQueue();
  }, []);

  const loadDailyQueue = async () => {
    setIsLoading(true);
    try {
      const newWords = await getDueWords(5);
      const reviewWords = await getDueWords(10);
      const combined = [...newWords, ...reviewWords];
      setDailyQueue(combined);
    } catch (error) {
      console.error('Error loading daily queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction: 'correct' | 'learning' | 'forgot') => {
    const currentWord = dailyQueue[currentWordIndex];
    const rating = direction === 'correct' ? 'easy' :
                  direction === 'learning' ? 'good' : 'forgot';

    const cardState = {
      difficulty: currentWord.difficulty || 2.5,
      stability: currentWord.stability || 1,
      retrievability: currentWord.retrievability || 0,
    };

    const updatedCard = updateCardState(cardState, rating);
    const nextReview = calculateNextReview(updatedCard, rating);

    await updateProgress(currentWord.id, {
      wordId: currentWord.id,
      lastReviewed: Date.now(),
      nextReview: nextReview.date.getTime(),
      difficulty: updatedCard.difficulty,
      stability: updatedCard.stability,
      retrievability: updatedCard.retrievability,
      correctCount: direction === 'correct' ? (currentWord.correctCount || 0) + 1 : (currentWord.correctCount || 0),
      incorrectCount: direction === 'forgot' ? (currentWord.incorrectCount || 0) + 1 : (currentWord.incorrectCount || 0),
    });

    const newCompletedCount = completedCount + 1;
    setCompletedCount(newCompletedCount);

    if (currentWordIndex < dailyQueue.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      incrementStreak();
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

  if (dailyQueue.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptyText}>No words due for review right now.</Text>
        <Text style={styles.emptySubtext}>Come back tomorrow for more practice.</Text>
      </View>
    );
  }

  if (completedCount >= dailyQueue.length) {
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
          {completedCount + 1} / {dailyQueue.length}
        </Text>
      </View>
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
