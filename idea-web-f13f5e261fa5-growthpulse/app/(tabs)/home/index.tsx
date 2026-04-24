import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { calendarService } from '../../../lib/api/calendarService';
import { healthService } from '../../../lib/api/healthService';
import { identifyHabitsFromEvents } from '../../../lib/ml/habitDetection';
import { calculateStreak } from '../../../lib/habitTracker';
import HealthMetricsCard from '../../../components/HealthMetricsCard';
import StreakCounter from '../../../components/StreakCounter';

interface Habit {
  id: string;
  name: string;
  frequency: number;
  currentStreak: number;
  progress: number;
  dates: string[];
}

interface HealthMetrics {
  steps: number;
  sleep: number;
  workouts: number;
}

const HomeScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    steps: 0,
    sleep: 0,
    workouts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch calendar events
      const calendarEvents = await calendarService.getEvents();

      // Fetch health data
      const healthData = await healthService.getHealthData();

      // Process calendar data to identify habits
      const detectedHabits = identifyHabitsFromEvents(calendarEvents);

      // Calculate streaks and progress for each habit
      const habitsWithStats = detectedHabits.map(habit => ({
        id: habit.id,
        name: habit.name,
        frequency: habit.frequency,
        currentStreak: calculateStreak(habit.dates),
        progress: Math.min(100, (habit.frequency / 7) * 100), // Assuming weekly goal
        dates: habit.dates
      }));

      // Process health metrics
      const metrics = {
        steps: healthData.steps || 0,
        sleep: healthData.sleep || 0,
        workouts: healthData.workouts || 0
      };

      setHabits(habitsWithStats);
      setHealthMetrics(metrics);
    } catch (err) {
      setError('Failed to load data. Please check your connections and try again.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading your habits and health data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Pull down to refresh</Text>
        </View>
      </ScrollView>
    );
  }

  // Find the habit with the longest streak
  const topHabit = habits.reduce((prev, current) =>
    (prev.currentStreak > current.currentStreak) ? prev : current
  , habits[0] || { name: 'No habits', currentStreak: 0 });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your habits and health metrics</Text>
      </View>

      {/* Health Metrics Section */}
      <HealthMetricsCard
        steps={healthMetrics.steps}
        sleep={healthMetrics.sleep}
        workouts={healthMetrics.workouts}
      />

      {/* Streak Counter */}
      <StreakCounter
        habitName={topHabit?.name || 'No habits'}
        streak={topHabit?.currentStreak || 0}
      />

      {/* Habits Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Habits</Text>
      </View>

      {habits.length > 0 ? (
        habits.map(habit => (
          <View key={habit.id} style={styles.habitCard}>
            <Text style={styles.habitTitle}>{habit.name}</Text>
            <Text style={styles.habitStreak}>Streak: {habit.currentStreak} days</Text>
            <Text style={styles.habitProgress}>Progress: {habit.progress}%</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No habits detected yet.</Text>
          <Text style={styles.emptySubtext}>Connect your calendar and health data to start tracking.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  habitCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  habitStreak: {
    fontSize: 14,
    color: '#6200EE',
    marginBottom: 4,
  },
  habitProgress: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
