import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useStore } from '../store/useStore';

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
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const { markWordReviewed } = useStore();

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

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
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsPlaying(false);
    }
  };

  const handleSwipe = async (direction: 'correct' | 'learning' | 'forgot') => {
    // Play haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Play pronunciation on swipe
    if (!isPlaying) {
      await playPronunciation();
    }

    // Update word progress in database
    await markWordReviewed(word.id, direction);

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
        speed: 20,
        bounciness: 0,
      }).start(() => {
        handleSwipe('correct');
        pan.setValue({ x: 0, y: 0 });
      });
    } else if (translationX < -120) {
      Animated.spring(pan, {
        toValue: { x: -500, y: 0 },
        useNativeDriver: false,
        speed: 20,
        bounciness: 0,
      }).start(() => {
        handleSwipe('learning');
        pan.setValue({ x: 0, y: 0 });
      });
    } else if (translationY > 120) {
      Animated.spring(pan, {
        toValue: { x: 0, y: 500 },
        useNativeDriver: false,
        speed: 20,
        bounciness: 0,
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

                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={playPronunciation}
                  disabled={isPlaying}
                >
                  <Ionicons
                    name={isPlaying ? "volume-high" : "volume-medium"}
                    size={24}
                    color={isPlaying ? "#4CAF50" : "#2196F3"}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.revealButton}
                onPress={() => setShowTranslation(true)}
              >
                <Text style={styles.revealButtonText}>Show Translation</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.swipeIndicators}>
            <View style={styles.swipeIndicatorContainer}>
              <Ionicons name="arrow-back" size={24} color="#FF9800" />
              <Text style={styles.swipeIndicatorText}>Learning</Text>
            </View>

            <View style={styles.swipeIndicatorContainer}>
              <Ionicons name="arrow-down" size={24} color="#F44336" />
              <Text style={styles.swipeIndicatorText}>Forgot</Text>
            </View>

            <View style={styles.swipeIndicatorContainer}>
              <Ionicons name="arrow-forward" size={24} color="#4CAF50" />
              <Text style={styles.swipeIndicatorText}>Know it</Text>
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
    height: '70%',
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
    justifyContent: 'space-between',
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
    color: '#1E40AF',
    marginBottom: 10,
    textAlign: 'center',
  },
  translationText: {
    fontSize: 24,
    color: '#4B5563',
    marginBottom: 15,
    textAlign: 'center',
  },
  exampleText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  audioButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#E0F2FE',
    marginBottom: 20,
  },
  revealButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    marginTop: 20,
  },
  revealButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  swipeIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  swipeIndicatorContainer: {
    alignItems: 'center',
  },
  swipeIndicatorText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
  },
});
