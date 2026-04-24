import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Streak, StreakStatus } from '../lib/streaks';

interface StreakBadgeProps {
  streak: Streak | null;
  size?: 'small' | 'medium' | 'large';
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, size = 'medium' }) => {
  if (!streak) {
    return (
      <View style={[styles.container, styles.noStreak, sizeStyles[size]]}>
        <Text style={[styles.text, sizeStyles[size].text]}>No streak</Text>
      </View>
    );
  }

  const { current, status } = streak;
  const emoji = getStreakEmoji(current);
  const color = getStreakColor(status);

  return (
    <View style={[styles.container, { backgroundColor: color }, sizeStyles[size]]}>
      <Text style={[styles.text, sizeStyles[size].text]}>
        {emoji} {current} day{current !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};

const sizeStyles = {
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    text: {
      fontSize: 12,
    },
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    text: {
      fontSize: 14,
    },
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    text: {
      fontSize: 16,
    },
  },
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  noStreak: {
    backgroundColor: '#E0E0E0',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default StreakBadge;
