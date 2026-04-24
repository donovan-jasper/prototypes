import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSessionStore } from '../../lib/store';
import { sessionManager } from '../../lib/sessionManager';
import SessionTimer from '../../components/SessionTimer';
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
  const [nextPromptIn, setNextPromptIn] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const coach = COACHES[coachId as keyof typeof COACHES];

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (isPaused) return;

      setNextPromptIn((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  useEffect(() => {
    if (!isActive) return;

    const unsubscribe = useSessionStore.subscribe(
      (state) => state.elapsedSeconds,
      (elapsedSeconds) => {
        // This will be called whenever elapsedSeconds changes
        // We can use it to update the next prompt time display
      }
    );

    return () => unsubscribe();
  }, [isActive]);

  const handleTogglePause = () => {
    togglePause();
    setIsPaused(!isPaused);
    sessionManager.handlePause();
  };

  const handleEndSession = async () => {
    await stopSpeaking();
    stopSession();
    sessionManager.cleanup();

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
              sessionManager.reset();
              router.push('/');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving session:', error);
      reset();
      sessionManager.reset();
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
          style={[styles.button, styles.pauseButton]}
          onPress={handleTogglePause}
        >
          <Text style={styles.buttonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.endButton]}
          onPress={handleEndSession}
        >
          <Text style={styles.buttonText}>End Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  coachEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  coachName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  taskContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  taskLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  taskName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
  },
  promptContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  promptLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  promptText: {
    fontSize: 18,
    color: '#333',
    fontStyle: 'italic',
  },
  nextPromptContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  nextPromptLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  nextPromptTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: '#ffcc00',
  },
  endButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
});
