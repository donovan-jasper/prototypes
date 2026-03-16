import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import WordCard from '../components/WordCard';
import { getDueWords, updateProgress } from '../lib/database';
import { calculateNextReview, updateCardState } from '../lib/fsrs';

export default function ReviewSession() {
  const { wordIds } = useLocalSearchParams();
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    const loadReviewQueue = async () => {
      if (wordIds) {
        const ids = JSON.parse(wordIds);
        const words = await getDueWords(ids);
        setReviewQueue(words);
      }
    };

    loadReviewQueue();
  }, [wordIds]);

  const handleSwipe = async (direction: 'correct' | 'learning' | 'forgot') => {
    const currentWord = reviewQueue[currentWordIndex];
    const rating = direction === 'correct' ? 'easy' :
                  direction === 'learning' ? 'good' : 'forgot';

    // Update FSRS state
    const updatedCard = updateCardState(currentWord, rating);
    const nextReview = calculateNextReview(updatedCard, rating);

    // Update database
    await updateProgress(currentWord.id, {
      lastReviewed: Date.now(),
      nextReview: nextReview.date.getTime(),
      difficulty: updatedCard.difficulty,
      stability: updatedCard.stability,
      retrievability: updatedCard.retrievability,
      correctCount: direction === 'correct' ? currentWord.correctCount + 1 : currentWord.correctCount,
      incorrectCount: direction === 'forgot' ? currentWord.incorrectCount + 1 : currentWord.incorrectCount,
    });

    // Move to next word
    if (currentWordIndex < reviewQueue.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
    setReviewedCount(reviewedCount + 1);
  };

  if (reviewQueue.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading review words...</Text>
      </View>
    );
  }

  if (reviewedCount === reviewQueue.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.completeText}>Review complete!</Text>
        <Text style={styles.statsText}>
          {reviewedCount} words reviewed
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {reviewedCount + 1}/{reviewQueue.length} words reviewed
        </Text>
      </View>
      <WordCard
        word={reviewQueue[currentWordIndex]}
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
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#4B5563',
  },
  completeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    color: '#1E40AF',
  },
  statsText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#4B5563',
  },
});
