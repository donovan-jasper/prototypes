import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="flame-outline" size={24} color="#ff9800" />
      <Text style={styles.streakText}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  streakText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff9800',
  },
});
