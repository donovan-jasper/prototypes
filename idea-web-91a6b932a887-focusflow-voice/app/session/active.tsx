import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import SessionTimer from '../../components/SessionTimer';
import VoiceCoach from '../../components/VoiceCoach';
import { Audio } from 'expo-av';
import { completeSession } from '../../lib/database';

export default function ActiveSessionScreen() {
  const router = useRouter();
  const {
    currentSession,
    startSession,
    pauseSession,
    resumeSession,
    completeSession: completeSessionAction,
    updateStats
  } = useStore();
  const [isPaused, setIsPaused] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    // Set up background audio
    const setupAudio = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/ambient.mp3'),
          { isLooping: true }
        );
        await sound.setIsLoopingAsync(true);
        setSound(sound);
        await sound.playAsync();
      } catch (error) {
        console.error('Failed to load sound', error);
      }
    };

    setupAudio();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && currentSession) {
        // App came back to foreground - resume session if needed
        if (isPaused) {
          resumeSession();
          setIsPaused(false);
        }
      }
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      subscription.remove();
    };
  }, []);

  const handlePauseResume = () => {
    if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
    setIsPaused(!isPaused);
  };

  const handleSessionComplete = async () => {
    try {
      // Complete session in database
      await completeSession(currentSession.id);

      // Update Zustand store
      completeSessionAction();

      // Update user stats
      updateStats(currentSession.duration);

      // Navigate to completion screen
      router.push('/session/complete');
    } catch (error) {
      console.error('Failed to complete session', error);
    }
  };

  if (!currentSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No active session found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SessionTimer
        duration={currentSession.duration}
        onComplete={handleSessionComplete}
        isPaused={isPaused}
      />

      <VoiceCoach
        duration={currentSession.duration}
        voicePack={currentSession.voicePack}
        isPaused={isPaused}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isPaused ? styles.resumeButton : styles.pauseButton]}
          onPress={handlePauseResume}
        >
          <Text style={styles.controlButtonText}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  controls: {
    marginTop: 40,
  },
  controlButton: {
    padding: 15,
    borderRadius: 8,
    width: 150,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
