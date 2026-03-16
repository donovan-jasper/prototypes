import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔥</Text>
      <Text style={styles.text}>{streak} day streak!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 5,
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
