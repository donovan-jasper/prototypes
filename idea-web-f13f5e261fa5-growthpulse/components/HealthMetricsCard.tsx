import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface HealthMetricsCardProps {
  steps: number;
  sleep: number;
  workouts: number;
}

const HealthMetricsCard: React.FC<HealthMetricsCardProps> = ({ steps, sleep, workouts }) => {
  return (
    <View style={styles.card}>
      <View style={styles.metricContainer}>
        <MaterialCommunityIcons name="walk" size={24} color="#6200EE" />
        <Text style={styles.metricValue}>{steps.toLocaleString()}</Text>
        <Text style={styles.metricLabel}>Steps</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricContainer}>
        <MaterialCommunityIcons name="sleep" size={24} color="#6200EE" />
        <Text style={styles.metricValue}>{Math.round(sleep)}</Text>
        <Text style={styles.metricLabel}>Sleep Hours</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricContainer}>
        <MaterialCommunityIcons name="dumbbell" size={24} color="#6200EE" />
        <Text style={styles.metricValue}>{workouts}</Text>
        <Text style={styles.metricLabel}>Workouts</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricContainer: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#eee',
    marginHorizontal: 12,
  },
});

export default HealthMetricsCard;
