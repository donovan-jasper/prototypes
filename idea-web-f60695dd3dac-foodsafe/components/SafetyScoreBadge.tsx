import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SafetyScoreBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

export const SafetyScoreBadge: React.FC<SafetyScoreBadgeProps> = ({ score, size = 'medium' }) => {
  // Determine color based on score
  let color = '#FF5252'; // Red for low scores
  if (score >= 70) color = '#FFC107'; // Yellow for medium scores
  if (score >= 90) color = '#4CAF50'; // Green for high scores

  // Determine size
  const sizeStyles = {
    small: {
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 12,
    },
    medium: {
      width: 40,
      height: 40,
      borderRadius: 20,
      fontSize: 16,
    },
    large: {
      width: 56,
      height: 56,
      borderRadius: 28,
      fontSize: 24,
    },
  }[size];

  return (
    <View style={[styles.badge, { backgroundColor: color }, sizeStyles]}>
      <Text style={[styles.scoreText, { fontSize: sizeStyles.fontSize }]}>{score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
