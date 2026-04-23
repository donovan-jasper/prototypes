import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, AppState, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import SessionTimer from '../../components/SessionTimer';
import VoiceCoach from '../../components/VoiceCoach';
import { Audio } from 'expo-av';
import { completeSession } from '../../lib/database';
import { Ionicons } from '@expo/vector-icons';

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
  const [showExitWarning, setShowExitWarning] = useState(false);

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

  const handleExitAttempt = () => {
    setShowExitWarning(true);
  };

  const handleExitConfirm = () => {
    router.back();
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
      <StatusBar barStyle="light-content" />

      {/* Exit warning modal */}
      {showExitWarning && (
        <View style={styles.exitWarning}>
          <View style={styles.exitWarningContent}>
            <Text style={styles.exitWarningTitle}>End Session?</Text>
            <Text style={styles.exitWarningText}>
              Your progress will be lost if you exit now.
            </Text>
            <View style={styles.exitWarningButtons}>
              <TouchableOpacity
                style={[styles.exitWarningButton, styles.cancelButton]}
                onPress={() => setShowExitWarning(false)}
              >
                <Text style={styles.exitWarningButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exitWarningButton, styles.confirmButton]}
                onPress={handleExitConfirm}
              >
                <Text style={styles.exitWarningButtonText}>End Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={handleExitAttempt} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.sessionTitle}>Focus Session</Text>
      </View>

      <View style={styles.timerContainer}>
        <SessionTimer
          duration={currentSession.duration}
          onComplete={handleSessionComplete}
          isPaused={isPaused}
        />
      </View>

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
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    zIndex: 10,
  },
  sessionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 40,
    alignItems: 'center',
  },
  controlButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: 180,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  exitWarning: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitWarningContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  exitWarningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  exitWarningText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  exitWarningButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  exitWarningButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#FF5252',
  },
  exitWarningButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
