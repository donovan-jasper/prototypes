import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SecurityBadgeProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
  score?: number;
}

const SecurityBadge: React.FC<SecurityBadgeProps> = ({ severity, score }) => {
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

  const getLabel = () => {
    switch (severity) {
      case 'critical':
        return 'Critical';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }]}>
      {score !== undefined && <Text style={styles.scoreText}>{score}</Text>}
      <Text style={styles.severityText}>{getLabel()}</Text>
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
