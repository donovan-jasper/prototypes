import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number;
  total?: number;
}

export default function ProgressBar({ progress, total = 1000 }: ProgressBarProps) {
  const percentage = Math.min(100, Math.floor((progress / total) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.percentageText}>{percentage}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },
  percentageText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#374151',
  },
});
