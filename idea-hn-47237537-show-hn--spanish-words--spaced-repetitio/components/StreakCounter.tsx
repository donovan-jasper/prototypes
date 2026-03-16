import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';

export default function StreakCounter() {
  const { streak, lastPracticed } = useStore();

  const getEncouragementMessage = () => {
    if (streak === 0) {
      return "Start your first streak today!";
    } else if (streak < 3) {
      return "Keep going! You're on a roll!";
    } else if (streak < 7) {
      return "Great job! Keep up the momentum!";
    } else {
      return "Amazing! You're on fire!";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>{streak}</Text>
        <Text style={styles.fireEmoji}>ðŸ”¥</Text>
      </View>
      <Text style={styles.messageText}>{getEncouragementMessage()}</Text>
      {lastPracticed && (
        <Text style={styles.dateText}>
          Last practiced: {new Date(lastPracticed).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginRight: 5,
  },
  fireEmoji: {
    fontSize: 24,
  },
  messageText: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
});
