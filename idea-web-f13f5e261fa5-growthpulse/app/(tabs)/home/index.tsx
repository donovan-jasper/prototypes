import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchHealthData, initializeHealthKit, initializeGoogleFit } from '../../../lib/healthService';
import { fetchCalendarEvents, identifyHabitsFromEvents } from '../../../lib/calendarService';
import { calculateStreak } from '../../../lib/habitTracker';

interface HealthStats {
  steps: number;
  sleep: number;
  workouts: number;
}

const HomeScreen = () => {
  const [healthData, setHealthData] = useState<HealthStats | null>(null);
  const [habits, setHabits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await initializeHealthKit();
        await initializeGoogleFit();

        const [health, events] = await Promise.all([
          fetchHealthData(),
          fetchCalendarEvents()
        ]);

        setHealthData(health);
        setHabits(identifyHabitsFromEvents(events));
      } catch (err) {
        setError('Failed to load data. Please check permissions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeServices();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ProgressPulse</Text>
        <Text style={styles.subtitle}>Your daily health and habits summary</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{healthData?.steps || 0}</Text>
            <Text style={styles.metricLabel}>Steps</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{healthData?.sleep || 0}</Text>
            <Text style={styles.metricLabel}>Sleep (hrs)</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{healthData?.workouts || 0}</Text>
            <Text style={styles.metricLabel}>Workouts</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detected Habits</Text>
        {habits.length > 0 ? (
          <View style={styles.habitsContainer}>
            {habits.map((habit, index) => (
              <View key={index} style={styles.habitTag}>
                <Text style={styles.habitText}>{habit}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noHabitsText}>No habits detected yet. Add some to your calendar!</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Streak</Text>
        <View style={styles.streakContainer}>
          <Text style={styles.streakValue}>{calculateStreak(['2023-10-01', '2023-10-02', '2023-10-03'])}</Text>
          <Text style={styles.streakLabel}>Days</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  habitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  habitTag: {
    backgroundColor: '#e0f2fe',
    padding: 8,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  habitText: {
    color: '#0369a1',
    fontSize: 14,
  },
  noHabitsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  streakLabel: {
    fontSize: 16,
    color: '#666',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default HomeScreen;
