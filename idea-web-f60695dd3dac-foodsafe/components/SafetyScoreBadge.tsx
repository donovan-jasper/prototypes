import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface SafetyScoreBadgeProps {
  score: number;
  lastInspectionDate: string;
  size?: 'small' | 'large';
}

export default function SafetyScoreBadge({ 
  score, 
  lastInspectionDate,
  size = 'small' 
}: SafetyScoreBadgeProps) {
  const getScoreColor = () => {
    if (score >= 90) return Colors.score.high;
    if (score >= 70) return Colors.score.medium;
    return Colors.score.low;
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Fair';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isLarge = size === 'large';
  const scoreColor = getScoreColor();

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <View style={[styles.scoreBadge, { backgroundColor: scoreColor }, isLarge && styles.scoreBadgeLarge]}>
        <Text style={[styles.score, isLarge && styles.scoreLarge]}>{score}</Text>
      </View>
      <Text style={[styles.label, isLarge && styles.labelLarge]}>{getScoreLabel()}</Text>
      <Text style={[styles.date, isLarge && styles.dateLarge]}>
        {formatDate(lastInspectionDate)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerLarge: {
    marginVertical: 8,
  },
  scoreBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreBadgeLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  score: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLarge: {
    fontSize: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  labelLarge: {
    fontSize: 16,
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  dateLarge: {
    fontSize: 12,
  },
});
