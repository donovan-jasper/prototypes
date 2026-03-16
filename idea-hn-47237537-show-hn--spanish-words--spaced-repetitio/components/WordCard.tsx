import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AudioPlayer from './AudioPlayer';

interface Word {
  id: number;
  word: string;
  translation: string;
  example: string;
  audioUrl: string;
  imageUrl?: string;
}

interface WordCardProps {
  word: Word;
  onSwipe: (direction: 'correct' | 'learning' | 'forgot') => void;
}

export default function WordCard({ word, onSwipe }: WordCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

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
          onSwipe('correct');
          pan.setValue({ x: 0, y: 0 });
        });
      } else if (gesture.dx < -120) {
        Animated.spring(pan, {
          toValue: { x: -500, y: 0 },
          useNativeDriver: false,
        }).start(() => {
          onSwipe('learning');
          pan.setValue({ x: 0, y: 0 });
        });
      } else if (gesture.dy > 120) {
        Animated.spring(pan, {
          toValue: { x: 0, y: 500 },
          useNativeDriver: false,
        }).start(() => {
          onSwipe('forgot');
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
    <View style={styles.container}>
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
    </View>
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
