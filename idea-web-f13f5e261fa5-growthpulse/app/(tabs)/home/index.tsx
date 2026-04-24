import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { calendarService } from '../../../lib/api/calendarService';
import { healthService } from '../../../lib/api/healthService';
import { calculateStreak } from '../../../lib/habitTracker';
import HealthMetricsCard from '../../../components/HealthMetricsCard';
import StreakCounter from '../../../components/StreakCounter';
import ProgressChart from '../../../components/ProgressChart';
import HabitCard from '../../../components/HabitCard';

interface Habit {
  id: string;
  name: string;
  frequency: number;
  currentStreak: number;
  progress: number;
  dates: string[];
  chartData: number[];
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

      // Initialize health services
      await healthService.initializeHealthKit();
      await healthService.initializeGoogleFit();

      // Fetch calendar events
      const calendarEvents = await calendarService.fetchCalendarEvents();

      // Fetch health data
      const healthData = await healthService.fetchHealthData();

      // Process calendar data to identify habits
      const detectedHabitNames = calendarService.identifyHabitsFromEvents(calendarEvents);

      // Calculate streaks and progress for each habit
      const habitsWithStats = detectedHabitNames.map((habitName, index) => {
        const habitEvents = calendarEvents.filter(event =>
          event.title.toLowerCase().includes(habitName)
        );

        const dates = habitEvents.map(event =>
          event.startDate.toISOString().split('T')[0]
        );

        return {
          id: `habit-${index}`,
          name: habitName,
          frequency: habitEvents.length,
          currentStreak: calculateStreak(dates),
          progress: Math.min(100, (habitEvents.length / 7) * 100),
          dates: dates,
          chartData: generateChartData(dates)
        };
      });

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

  const generateChartData = (dates: string[]): number[] => {
    const last7Days = Array(7).fill(0);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      if (dates.includes(dateString)) {
        last7Days[6 - i] = 1;
      }
    }

    return last7Days;
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
        currentStreak={topHabit?.currentStreak || 0}
      />

      {/* Progress Chart */}
      {topHabit && (
        <ProgressChart
          title={topHabit.name}
          data={topHabit.chartData}
        />
      )}

      {/* Habits List */}
      <View style={styles.habitsSection}>
        <Text style={styles.sectionTitle}>Your Habits</Text>
        {habits.length > 0 ? (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              name={habit.name}
              streak={habit.currentStreak}
              progress={habit.progress}
              chartData={habit.chartData}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits detected yet.</Text>
            <Text style={styles.emptySubtext}>Add events to your calendar to track them automatically.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200EE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  habitsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen;
