import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AudioPlayer from './AudioPlayer';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

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
  correctCount?: number;
  incorrectCount?: number;
}

interface WordCardProps {
  word: Word;
  onSwipe: (direction: 'correct' | 'learning' | 'forgot') => void;
}

export default function WordCard({ word, onSwipe }: WordCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playPronunciation = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: word.audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleSwipe = async (direction: 'correct' | 'learning' | 'forgot') => {
    // Play haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Play pronunciation on swipe
    await playPronunciation();

    // Notify parent component
    onSwipe(direction);
  };

  const handleGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: pan.x,
          translationY: pan.y,
        },
      },
    ],
    { useNativeDriver: false }
  );

  const handleGestureEnd = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;

    if (translationX > 120) {
      Animated.spring(pan, {
        toValue: { x: 500, y: 0 },
        useNativeDriver: false,
      }).start(() => {
        handleSwipe('correct');
        pan.setValue({ x: 0, y: 0 });
      });
    } else if (translationX < -120) {
      Animated.spring(pan, {
        toValue: { x: -500, y: 0 },
        useNativeDriver: false,
      }).start(() => {
        handleSwipe('learning');
        pan.setValue({ x: 0, y: 0 });
      });
    } else if (translationY > 120) {
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
  };

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
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureEnd}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
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
                onPress={() => {
                  setShowTranslation(true);
                  playPronunciation();
                }}
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
      </PanGestureHandler>
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
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
  },
  cardContent: {
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
    color: '#1E40AF',
    marginBottom: 10,
  },
  translationText: {
    fontSize: 24,
    color: '#4B5563',
    marginBottom: 15,
  },
  exampleText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  showTranslationButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
  },
  showTranslationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  swipeIndicators: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  indicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
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
