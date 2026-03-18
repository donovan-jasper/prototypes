import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  score: number;
  isPassive?: boolean;
}

export default function TrustScoreGauge({ score, isPassive = false }: Props) {
  const getColor = () => {
    if (score >= 80) return '#34C759';
    if (score >= 60) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <View style={styles.container}>
      <View style={styles.gauge}>
        <View
          style={[
            styles.fill,
            { width: `${score}%`, backgroundColor: getColor() },
          ]}
        />
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{score}</Text>
        <View style={[styles.badge, isPassive ? styles.badgePassive : styles.badgeVerified]}>
          <Text style={styles.badgeText}>{isPassive ? 'PASSIVE' : 'VERIFIED'}</Text>
        </View>
      </View>
      <Text style={styles.label}>Trust Score</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  gauge: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePassive: {
    backgroundColor: '#FF9500',
  },
  badgeVerified: {
    backgroundColor: '#34C759',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
