import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMoments, useSettings } from '../../src/hooks';
import { Audio } from 'expo-av';
import { useAppContext } from '../../src/context/AppContext';

export default function MomentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { moments, completeMoment } = useMoments();
  const { settings } = useSettings();
  const { isPremium } = useAppContext();
  const [moment, setMoment] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [moodRating, setMoodRating] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const scrollViewRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (moments && moments.length > 0) {
      const foundMoment = moments.find(m => m.id === id) || moments[0];
      setMoment(foundMoment);
    }
  }, [moments, id]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playAudio = async () => {
    if (!moment?.audioPath) return;

    const { sound } = await Audio.Sound.createAsync(
      require(`../../assets/audio/${moment.audioPath}`),
      { shouldPlay: true }
    );
    setSound(sound);
    setIsPlaying(true);

    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) {
        setIsPlaying(false);
        completeMomentHandler();
      }
    });
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const completeMomentHandler = async () => {
    if (moment) {
      await completeMoment(moment.id, moodRating);
      setIsCompleted(true);
    }
  };

  const scrollToEnd = () => {
    if (scrollViewRef.current && moment?.script) {
      const contentHeight = moment.script.split('\n').length * 30; // Approximate line height
      scrollViewRef.current.scrollTo({ y: contentHeight, animated: true });
    }
  };

  if (!moment) return <Text>Loading moment...</Text>;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <Text style={styles.category}>{moment.category}</Text>
        <Text style={styles.title}>{moment.title}</Text>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.script}>{moment.script}</Text>
      </Animated.ScrollView>

      <View style={styles.controls}>
        {moment.audioPath && (
          <TouchableOpacity
            style={styles.audioButton}
            onPress={isPlaying ? pauseAudio : playAudio}
          >
            <Text style={styles.audioButtonText}>
              {isPlaying ? 'Pause Audio' : 'Play Audio'}
            </Text>
          </TouchableOpacity>
        )}

        {!isCompleted ? (
          <>
            <Text style={styles.prompt}>How do you feel after this moment?</Text>
            <View style={styles.moodRating}>
              {['😔', '🙁', '😐', '🙂', '😊'].map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.emojiButton,
                    moodRating === index + 1 && styles.selectedEmoji
                  ]}
                  onPress={() => setMoodRating(index + 1)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={completeMomentHandler}
            >
              <Text style={styles.completeButtonText}>Complete Moment</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.completedContainer}>
            <Text style={styles.completedTitle}>Moment Completed!</Text>
            <Text style={styles.completedMessage}>
              Great job taking this moment. Your streak will be updated.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 24,
    backgroundColor: '#1976d2',
    alignItems: 'center',
  },
  category: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  script: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
  },
  controls: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  audioButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  audioButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  prompt: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  moodRating: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  emojiButton: {
    padding: 8,
    borderRadius: 20,
  },
  selectedEmoji: {
    backgroundColor: '#e3f2fd',
  },
  emoji: {
    fontSize: 24,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedContainer: {
    alignItems: 'center',
    padding: 16,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4CAF50',
  },
  completedMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
