import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SecurityBadgeProps {
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SecurityBadge: React.FC<SecurityBadgeProps> = ({ score, severity }) => {
  const getColor = () => {
    switch (severity) {
      case 'critical':
        return '#FF4444';
      case 'high':
        return '#FF8800';
      case 'medium':
        return '#FFBB33';
      case 'low':
        return '#00C851';
      default:
        return '#999999';
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }]}>
      <Text style={styles.scoreText}>{score}</Text>
      <Text style={styles.severityText}>{severity}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  scoreText: {
    fontWeight: 'bold',
    color: 'white',
    marginRight: 4,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
  },
});

export default SecurityBadge;
