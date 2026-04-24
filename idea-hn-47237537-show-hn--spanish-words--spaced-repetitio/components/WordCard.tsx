import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useStore } from '../store/useStore';

const { width, height } = Dimensions.get('window');

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
        toValue: { x: width * 1.5, y: 0 },
        useNativeDriver: false,
        speed: 20,
        bounciness: 0,
      }).start(() => {
        handleSwipe('correct');
        pan.setValue({ x: 0, y: 0 });
      });
    } else if (translationX < -120) {
      Animated.spring(pan, {
        toValue: { x: -width * 1.5, y: 0 },
        useNativeDriver: false,
        speed: 20,
        bounciness: 0,
      }).start(() => {
        handleSwipe('learning');
        pan.setValue({ x: 0, y: 0 });
      });
    } else if (translationY > 120) {
      Animated.spring(pan, {
        toValue: { x: 0, y: height * 1.5 },
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

                <View style={styles.swipeIndicators}>
                  <View style={[styles.swipeIndicator, styles.swipeLeft]}>
                    <Ionicons name="arrow-back" size={24} color="#FF5252" />
                    <Text style={styles.swipeText}>Learning</Text>
                  </View>

                  <View style={[styles.swipeIndicator, styles.swipeDown]}>
                    <Ionicons name="arrow-down" size={24} color="#FFC107" />
                    <Text style={styles.swipeText}>Forgot</Text>
                  </View>

                  <View style={[styles.swipeIndicator, styles.swipeRight]}>
                    <Ionicons name="arrow-forward" size={24} color="#4CAF50" />
                    <Text style={styles.swipeText}>Know it</Text>
                  </View>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={styles.revealButton}
                onPress={() => setShowTranslation(true)}
              >
                <Text style={styles.revealText}>Show Translation</Text>
              </TouchableOpacity>
            )}
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
    width: width * 0.9,
    height: height * 0.7,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  wordText: {
    fontSize: 36,
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
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  audioButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#E0F2FE',
    borderRadius: 50,
  },
  revealButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
  },
  revealText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  swipeIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
  },
  swipeIndicator: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  swipeLeft: {
    backgroundColor: '#FFEBEE',
  },
  swipeDown: {
    backgroundColor: '#FFF8E1',
  },
  swipeRight: {
    backgroundColor: '#E8F5E9',
  },
  swipeText: {
    fontSize: 12,
    marginTop: 5,
    color: '#4B5563',
  },
});
