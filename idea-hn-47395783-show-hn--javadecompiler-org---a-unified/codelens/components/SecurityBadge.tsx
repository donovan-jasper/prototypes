import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SecurityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const severityColors = {
  critical: '#FF0000',
  high: '#FF8C00',
  medium: '#FFD700',
  low: '#90EE90'
};

const severityLabels = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({ severity }) => {
  return (
    <View style={[styles.badge, { backgroundColor: severityColors[severity] }]}>
      <Text style={styles.text}>{severityLabels[severity]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  }
});
