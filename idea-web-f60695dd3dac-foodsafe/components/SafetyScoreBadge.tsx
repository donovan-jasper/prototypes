import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SafetyScoreBadgeProps {
  score: number;
  lastInspectionDate: string;
}

const SafetyScoreBadge: React.FC<SafetyScoreBadgeProps> = ({ score, lastInspectionDate }) => {
  const getScoreColor = () => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const getScoreText = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Attention';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.scoreCircle, { backgroundColor: getScoreColor() }]}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.scoreLabel}>{getScoreText()}</Text>
        <Text style={styles.dateText}>Last inspected: {lastInspectionDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  scoreText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
});

export default SafetyScoreBadge;
