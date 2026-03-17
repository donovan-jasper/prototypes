import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import SessionTimer from '../../components/SessionTimer';
import VoiceCoach from '../../components/VoiceCoach';
import { Ionicons } from '@expo/vector-icons';

export default function ActiveSessionScreen() {
  const router = useRouter();
  const { currentSession, completeSession, pauseSession, resumeSession } = useStore();
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const handlePauseResume = () => {
    if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
    setIsPaused(!isPaused);
  };

  const handleComplete = () => {
    setSessionComplete(true);
    setTimeout(() => {
      completeSession();
      router.push('/(tabs)/index');
    }, 2000);
  };

  const handleProgress = (elapsed: number) => {
    setElapsedSeconds(elapsed);
  };

  if (!currentSession) {
    return (
      <View style={styles.container}>
        <Text>No active session</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VoiceCoach
        elapsedSeconds={elapsedSeconds}
        sessionDuration={currentSession.duration}
        onSessionComplete={sessionComplete}
      />

      <View style={styles.timerContainer}>
        <SessionTimer
          duration={currentSession.duration}
          onComplete={handleComplete}
          onProgress={handleProgress}
          isPaused={isPaused}
        />
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handlePauseResume}>
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={30}
            color="#6c5ce7"
          />
          <Text style={styles.controlText}>{isPaused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Voice Pack: {currentSession.voicePack}</Text>
        <Text style={styles.infoText}>Points: {currentSession.points}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    marginBottom: 40,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  controlButton: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  controlText: {
    color: '#6c5ce7',
    fontSize: 16,
    marginTop: 5,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  infoText: {
    color: '#636e72',
    fontSize: 14,
    marginBottom: 5,
  },
});
