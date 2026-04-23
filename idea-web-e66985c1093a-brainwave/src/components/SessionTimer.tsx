import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppContext } from '../context/AppContext';

interface SessionTimerProps {
  isActive: boolean;
  elapsedSeconds: number;
  drowsinessEvents: number;
  onStart: () => void;
  onStop: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  isActive,
  elapsedSeconds,
  drowsinessEvents,
  onStart,
  onStop,
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Drowsiness Events: {drowsinessEvents}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isActive ? styles.stopButton : styles.startButton]}
        onPress={isActive ? onStop : onStart}
        disabled={isActive && !elapsedSeconds}
      >
        {isActive ? (
          <Text style={styles.buttonText}>Stop Session</Text>
        ) : (
          <Text style={styles.buttonText}>Start Session</Text>
        )}
      </TouchableOpacity>

      {isActive && !elapsedSeconds && (
        <ActivityIndicator size="small" color="#4CAF50" style={styles.loadingIndicator} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 10,
  },
});
