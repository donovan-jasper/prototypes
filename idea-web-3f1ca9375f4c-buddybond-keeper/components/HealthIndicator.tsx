import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Friend } from '@/lib/types';
import { calculateHealthScore } from '@/lib/database';

interface HealthIndicatorProps {
  friend: Friend;
  size?: number;
}

export default function HealthIndicator({ friend, size = 12 }: HealthIndicatorProps) {
  const healthStatus = calculateHealthScore(friend);

  const getColor = () => {
    switch (healthStatus) {
      case 'healthy':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'neglected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View
      style={[
        styles.indicator,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getColor(),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  indicator: {
    borderRadius: 6,
  },
});
