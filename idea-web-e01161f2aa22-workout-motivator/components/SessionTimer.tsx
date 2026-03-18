import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSessionStore } from '../lib/store';

export default function SessionTimer() {
  const { elapsedSeconds, isActive, tick } = useSessionStore();

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, tick]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Time Elapsed</Text>
      <Text style={styles.time}>{formatTime(elapsedSeconds)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  time: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#007AFF',
    fontVariant: ['tabular-nums'],
  },
});
