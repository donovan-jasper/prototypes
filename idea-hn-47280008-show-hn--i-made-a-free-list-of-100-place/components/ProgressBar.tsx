import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  percentage: number;
}

export default function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Launch Progress</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
      <View style={styles.milestones}>
        {[25, 50, 75, 100].map((milestone) => (
          <View
            key={milestone}
            style={[
              styles.milestone,
              percentage >= milestone && styles.milestoneActive,
            ]}
          >
            <Text
              style={[
                styles.milestoneText,
                percentage >= milestone && styles.milestoneTextActive,
              ]}
            >
              {milestone}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  percentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  milestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  milestoneActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  milestoneTextActive: {
    color: '#FFFFFF',
  },
});
