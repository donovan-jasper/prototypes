import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AudioPlayer from './AudioPlayer';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { calculateNextReview, updateCardState } from '../lib/fsrs';
import { updateProgress } from '../lib/database';

interface Word {
  id: number;
  word: string;
  translation: string;
  example: string;
  audioUrl: string;
  imageUrl?: string;
  difficulty?: number;
  stability?: number;
  retrievability?: number;
}

interface WordCardProps {
  word: Word;
  onSwipe: (direction: 'correct' | 'learning' | 'forgot') => void;
}

export default function WordCard({ word, onSwipe }: WordCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

  const handleSwipe = async (direction: 'correct' | 'learning' | 'forgot') => {
    // Calculate FSRS parameters
    const rating = direction === 'correct' ? 'easy' :
                  direction === 'learning' ? 'good' : 'forgot';

    const cardState = {
      difficulty: word.difficulty || 2.5,
      stability: word.stability || 1,
      retrievability: word.retrievability || 0.5
    };

    const updatedState = updateCardState(cardState, rating);
    const nextReview = calculateNextReview(updatedState, rating);

    // Update database
    await updateProgress(word.id, {
      wordId: word.id,
      lastReviewed: Date.now(),
      nextReview: nextReview.date.getTime(),
      difficulty: updatedState.difficulty,
      stability: updatedState.stability,
      retrievability: updatedState.retrievability,
      correctCount: direction === 'correct' ? (word.correctCount || 0) + 1 : word.correctCount,
      incorrectCount: direction === 'forgot' ? (word.incorrectCount || 0) + 1 : word.incorrectCount
    });

    // Notify parent component
    onSwipe(direction);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([
      null,
      { dx: pan.x, dy: pan.y },
    ], { useNativeDriver: false }),
    onPanResponderRelease: (e, gesture) => {
      if (gesture.dx > 120) {
        Animated.spring(pan, {
          toValue: { x: 500, y: 0 },
          useNativeDriver: false,
        }).start(() => {
          handleSwipe('correct');
          pan.setValue({ x: 0, y: 0 });
        });
      } else if (gesture.dx < -120) {
        Animated.spring(pan, {
          toValue: { x: -500, y: 0 },
          useNativeDriver: false,
        }).start(() => {
          handleSwipe('learning');
          pan.setValue({ x: 0, y: 0 });
        });
      } else if (gesture.dy > 120) {
        Animated.spring(pan, {
          toValue: { x: 0, y: 500 },
          useNativeDriver: false,
        }).start(() => {
          handleSwipe('forgot');
          pan.setValue({ x: 0, y: 0 });
        });
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate },
    ],
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.View
        style={[styles.card, animatedStyle]}
        {...panResponder.panHandlers}
      >
        <View style={styles.cardContent}>
          {word.imageUrl && (
            <Image
              source={{ uri: word.imageUrl }}
              style={styles.wordImage}
              resizeMode="contain"
            />
          )}

          <Text style={styles.wordText}>{word.word}</Text>

          {showTranslation ? (
            <>
              <Text style={styles.translationText}>{word.translation}</Text>
              <Text style={styles.exampleText}>{word.example}</Text>
              <AudioPlayer audioUrl={word.audioUrl} />
            </>
          ) : (
            <TouchableOpacity
              style={styles.showTranslationButton}
              onPress={() => setShowTranslation(true)}
            >
              <Text style={styles.showTranslationText}>Show Translation</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.swipeIndicators}>
          <View style={[styles.indicator, styles.correct]}>
            <Ionicons name="checkmark" size={24} color="white" />
          </View>
          <View style={[styles.indicator, styles.learning]}>
            <Ionicons name="help" size={24} color="white" />
          </View>
          <View style={[styles.indicator, styles.forgot]}>
            <Ionicons name="close" size={24} color="white" />
          </View>
        </View>
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E40AF',
  },
  translationText: {
    fontSize: 24,
    marginBottom: 15,
    color: '#4B5563',
  },
  exampleText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  showTranslationButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
  },
  showTranslationText: {
    color: 'white',
    fontSize: 16,
  },
  swipeIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  indicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correct: {
    backgroundColor: '#10B981',
  },
  learning: {
    backgroundColor: '#F59E0B',
  },
  forgot: {
    backgroundColor: '#EF4444',
  },
});
