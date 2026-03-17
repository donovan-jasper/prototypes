import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakDisplayProps {
  streak: number;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Streak</Text>
      <View style={styles.streakContainer}>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakText}>day{streak !== 1 ? 's' : ''}</Text>
      </View>
      <Text style={styles.subtitle}>Keep taking moments to build your streak!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  streakText: {
    fontSize: 16,
    color: '#2E7D32',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
});
