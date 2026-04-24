import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HealthMetricsCardProps {
  steps: number;
  sleep: number;
  workouts: number;
}

const HealthMetricsCard: React.FC<HealthMetricsCardProps> = ({ steps, sleep, workouts }) => {
  return (
    <View style={styles.card}>
      <View style={styles.metricContainer}>
        <Ionicons name="walk-outline" size={24} color="#6200EE" />
        <Text style={styles.metricValue}>{steps.toLocaleString()}</Text>
        <Text style={styles.metricLabel}>Steps</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricContainer}>
        <Ionicons name="moon-outline" size={24} color="#6200EE" />
        <Text style={styles.metricValue}>{sleep.toFixed(1)}</Text>
        <Text style={styles.metricLabel}>Hours</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricContainer}>
        <Ionicons name="barbell-outline" size={24} color="#6200EE" />
        <Text style={styles.metricValue}>{workouts}</Text>
        <Text style={styles.metricLabel}>Workouts</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 20,
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
    marginTop: 5,
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#eee',
  },
});

export default HealthMetricsCard;
