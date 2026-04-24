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
      <Text style={styles.cardTitle}>Today's Health</Text>

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Ionicons name="walk" size={24} color="#6200EE" style={styles.icon} />
          <View>
            <Text style={styles.metricValue}>{steps.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Steps</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="moon" size={24} color="#6200EE" style={styles.icon} />
          <View>
            <Text style={styles.metricValue}>{sleep.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Hours Sleep</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="barbell" size={24} color="#6200EE" style={styles.icon} />
          <View>
            <Text style={styles.metricValue}>{workouts}</Text>
            <Text style={styles.metricLabel}>Workouts</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6200EE',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default HealthMetricsCard;
