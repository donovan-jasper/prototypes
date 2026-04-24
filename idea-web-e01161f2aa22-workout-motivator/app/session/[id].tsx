import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSessionStore } from '../../lib/store';
import SessionTimer from '../../components/SessionTimer';
import { generatePrompt, selectPromptByIntensity, getRandomInterval } from '../../lib/prompts';
import { speakPrompt, stopSpeaking } from '../../lib/audio';
import { CoachId } from '../../constants/Prompts';
import { saveSession, calculateXP } from '../../lib/database';

const COACHES = {
  'drill-sergeant': { name: 'Drill Sergeant', emoji: '🎖️' },
  'zen-master': { name: 'Zen Master', emoji: '🧘' },
  'best-friend': { name: 'Best Friend', emoji: '🤗' },
  'comedian': { name: 'Comedian', emoji: '😂' },
  'stoic': { name: 'Stoic Philosopher', emoji: '🏛️' },
};

export default function SessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { taskName, coachId, isActive, stopSession, reset, elapsedSeconds, togglePause } = useSessionStore();
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [nextPromptIn, setNextPromptIn] = useState<number>(getRandomInterval());
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lastPromptTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  const coach = COACHES[coachId as keyof typeof COACHES];

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setNextPromptIn((prev) => {
        if (prev <= 1) {
          playMotivationalPrompt();
          return getRandomInterval();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, coachId]);

  const playMotivationalPrompt = async () => {
    if (!coachId || isPaused) return;

    const secondsSinceLastPrompt = elapsedSeconds - lastPromptTimeRef.current;
    const prompt = selectPromptByIntensity(coachId as CoachId, secondsSinceLastPrompt);

    setLastPrompt(prompt);
    lastPromptTimeRef.current = elapsedSeconds;

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await speakPrompt(prompt, coachId);
    } catch (error) {
      console.error('Error speaking prompt:', error);
    }
  };

  const handleTogglePause = () => {
    togglePause();
    setIsPaused(!isPaused);

    if (!isPaused) {
      pauseTimeRef.current = Date.now();
    } else {
      const pauseDuration = (Date.now() - pauseTimeRef.current) / 1000;
      // Adjust next prompt time based on pause duration
      setNextPromptIn(prev => Math.max(60, prev - Math.floor(pauseDuration)));
    }
  };

  const handleEndSession = async () => {
    await stopSpeaking();
    stopSession();

    const xpEarned = calculateXP(elapsedSeconds);

    try {
      await saveSession({
        taskName,
        coachId,
        duration: elapsedSeconds,
        completedAt: Date.now(),
        xpEarned,
      });

      Alert.alert(
        'Session Complete! 🎉',
        `Great work! You earned ${xpEarned} XP for ${Math.floor(elapsedSeconds / 60)} minutes of focused work.`,
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              router.push('/');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving session:', error);
      reset();
      router.push('/');
    }
  };

  if (!taskName || !coach) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.coachEmoji}>{coach.emoji}</Text>
        <Text style={styles.coachName}>{coach.name}</Text>
      </View>

      <View style={styles.taskContainer}>
        <Text style={styles.taskLabel}>Current Task</Text>
        <Text style={styles.taskName}>{taskName}</Text>
      </View>

      <SessionTimer />

      {lastPrompt && (
        <Animated.View style={[styles.promptContainer, { opacity: fadeAnim }]}>
          <Text style={styles.promptLabel}>💬 Coach says:</Text>
          <Text style={styles.promptText}>{lastPrompt}</Text>
        </Animated.View>
      )}

      <View style={styles.nextPromptContainer}>
        <Text style={styles.nextPromptLabel}>Next motivation in:</Text>
        <Text style={styles.nextPromptTime}>
          {Math.floor(nextPromptIn / 60)}:{(nextPromptIn % 60).toString().padStart(2, '0')}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isPaused ? styles.resumeButton : styles.pauseButton]}
          onPress={handleTogglePause}
        >
          <Text style={styles.controlButtonText}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
          <Text style={styles.endButtonText}>End Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  coachEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  coachName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  taskContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  taskLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  promptContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  promptLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  promptText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  nextPromptContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  nextPromptLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextPromptTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 40,
  },
  controlButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  resumeButton: {
    backgroundColor: '#34C759',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  endButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  endButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 40,
  },
});
