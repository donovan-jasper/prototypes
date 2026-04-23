import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface SafetyScoreBadgeProps {
  score: number;
  lastInspectionDate: string;
  violationCount: number;
}

export const SafetyScoreBadge: React.FC<SafetyScoreBadgeProps> = ({
  score,
  lastInspectionDate,
  violationCount,
}) => {
  // Determine color based on score
  let color = Colors.green;
  if (score < 80) color = Colors.yellow;
  if (score < 70) color = Colors.red;

  // Format the date
  const formattedDate = new Date(lastInspectionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={[styles.scoreContainer, { backgroundColor: color }]}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Safety Score</Text>
        <Text style={styles.date}>Last inspected: {formattedDate}</Text>
        <Text style={styles.violations}>
          {violationCount} {violationCount === 1 ? 'violation' : 'violations'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  violations: {
    fontSize: 14,
    color: Colors.text,
  },
});
