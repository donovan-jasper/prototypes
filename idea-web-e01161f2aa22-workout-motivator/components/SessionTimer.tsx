import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSessionStore } from '../lib/store';

export default function SessionTimer() {
  const { elapsedSeconds, isPaused } = useSessionStore();
  const [displayTime, setDisplayTime] = useState('00:00:00');

  useEffect(() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    setDisplayTime(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  }, [elapsedSeconds]);

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{displayTime}</Text>
      {isPaused && <Text style={styles.pausedText}>PAUSED</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  pausedText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: 'bold',
    marginTop: 5,
  },
});
