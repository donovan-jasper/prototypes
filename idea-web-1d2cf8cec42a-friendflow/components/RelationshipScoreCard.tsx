import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Contact, Interaction } from '../types';
import { calculateRelationshipScore, getStreakDays } from '../lib/analytics';
import { useTheme } from 'react-native-paper';

interface RelationshipScoreCardProps {
  contact: Contact;
  interactions: Interaction[];
  currentDate: Date;
}

const RelationshipScoreCard: React.FC<RelationshipScoreCardProps> = ({ contact, interactions, currentDate }) => {
  const theme = useTheme();
  const score = calculateRelationshipScore(contact, interactions, currentDate);
  const streakDays = getStreakDays(interactions, currentDate);

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return theme.colors.primary;
    if (score >= 50) return theme.colors.accent;
    return theme.colors.error;
  };

  // Calculate bar width based on score
  const barWidth = `${Math.min(100, Math.max(0, score))}%`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relationship Health</Text>
        <Text style={[styles.score, { color: getScoreColor() }]}>{Math.round(score)}</Text>
      </View>

      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: barWidth, backgroundColor: getScoreColor() }]} />
      </View>

      <View style={styles.streakContainer}>
        <Text style={styles.streakLabel}>Current Streak:</Text>
        <Text style={styles.streakValue}>{streakDays} days</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
  },
  streakValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default RelationshipScoreCard;
