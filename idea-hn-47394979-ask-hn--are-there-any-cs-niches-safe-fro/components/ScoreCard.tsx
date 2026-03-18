import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScoreCategory } from '../types';

interface Props {
  score: number;
  category: ScoreCategory;
}

export default function ScoreCard({ score, category }: Props) {
  const colors = {
    low: '#ef4444',
    medium: '#f59e0b',
    high: '#10b981'
  };
  
  const labels = {
    low: 'Action Needed',
    medium: 'Moderate Risk',
    high: 'High Resistance'
  };
  
  return (
    <View style={[styles.card, { borderColor: colors[category] }]}>
      <Text style={[styles.score, { color: colors[category] }]}>{score}</Text>
      <Text style={styles.label}>AI Resistance Score</Text>
      <View style={[styles.badge, { backgroundColor: colors[category] }]}>
        <Text style={styles.badgeText}>{labels[category]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  score: {
    fontSize: 72,
    fontWeight: 'bold',
    letterSpacing: -2
  },
  label: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 16
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  }
});
