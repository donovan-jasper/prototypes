import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSessionStore } from '../lib/store';

const SessionTimer = () => {
  const { elapsedSeconds } = useSessionStore();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Session Time</Text>
      <Text style={styles.time}>{formatTime(elapsedSeconds)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SessionTimer;
