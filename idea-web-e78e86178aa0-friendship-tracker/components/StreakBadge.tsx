import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Streak } from '@/lib/database';

interface StreakBadgeProps {
  streak: Streak;
  onFreeze?: () => void;
  isPremium?: boolean;
}

export default function StreakBadge({ streak, onFreeze, isPremium }: StreakBadgeProps) {
  const isAtRisk = streak.currentDays > 0 && streak.currentDays < 3;
  const isBroken = streak.currentDays === 0 && streak.lastInteraction !== null;

  const getStreakColor = () => {
    if (streak.freezeUsed) return '#FF9500'; // Orange for frozen
    if (isBroken) return '#FF3B30'; // Red for broken
    if (isAtRisk) return '#FFCC00'; // Yellow for at risk
    return '#34C759'; // Green for good
  };

  const streakText = streak.currentDays > 0
    ? `${streak.currentDays} day${streak.currentDays !== 1 ? 's' : ''}`
    : 'No streak';

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: getStreakColor() }]}>
        <Text style={styles.badgeText}>
          {streak.currentDays > 0 ? '🔥' : '💤'} {streakText}
        </Text>
      </View>

      {streak.currentDays > 0 && !streak.freezeUsed && isPremium && (
        <TouchableOpacity
          style={styles.freezeButton}
          onPress={onFreeze}
          activeOpacity={0.7}
        >
          <Text style={styles.freezeButtonText}>Freeze</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  freezeButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freezeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
