import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(elapsedSeconds)}</Text>
      <Text style={styles.events}>Drowsiness events: {drowsinessEvents}</Text>
      <TouchableOpacity
        style={[styles.button, isActive ? styles.stopButton : styles.startButton]}
        onPress={isActive ? onStop : onStart}
      >
        <Text style={styles.buttonText}>{isActive ? 'Stop' : 'Start'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  events: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    width: 150,
    height: 50,
    borderRadius: 25,
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
});
