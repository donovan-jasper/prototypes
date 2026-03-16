import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function StreakBadge({ streak }: { streak: number }) {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">{streak}</Text>
      <Text variant="bodyMedium">day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    margin: 16,
  },
});
