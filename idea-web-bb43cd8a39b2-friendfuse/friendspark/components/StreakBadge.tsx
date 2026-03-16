import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StreakBadge = ({ streak }) => {
  if (!streak) {
    return <Text style={styles.noStreak}>No streak yet</Text>;
  }

  const getStreakColor = () => {
    if (streak.status === 'at-risk') return '#FFD700'; // Gold
    if (streak.current >= 30) return '#FF6B6B'; // Coral
    if (streak.current >= 14) return '#4CAF50'; // Green
    if (streak.current >= 7) return '#2196F3'; // Blue
    return '#888'; // Gray
  };

  return (
    <View style={[styles.container, { backgroundColor: getStreakColor() }]}>
      <Text style={styles.text}>
        {streak.current} day streak
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
  },
  noStreak: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
});

export default StreakBadge;
