import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { calculateAccuracy } from '../utils/calculations';

interface SessionTimerProps {
  hits: number;
  totalAttempts: number;
  onEndSession: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ hits, totalAttempts, onEndSession }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const accuracy = calculateAccuracy(hits, totalAttempts);

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={styles.statValue}>{accuracy}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Hits</Text>
          <Text style={styles.statValue}>{hits}/{totalAttempts}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.endButton} onPress={onEndSession}>
        <Text style={styles.buttonText}>End Session</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  endButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
