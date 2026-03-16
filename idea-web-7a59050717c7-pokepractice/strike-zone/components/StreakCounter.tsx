import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const StreakCounter = ({ streak }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.streakText}>Streak: {streak} ðŸ”¥</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StreakCounter;
