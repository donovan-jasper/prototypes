import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { calendarService } from '../../../lib/api/calendarService';
import { healthService } from '../../../lib/api/healthService';
import { calculateStreak } from '../../../lib/habitTracker';
import HealthMetricsCard from '../../../components/HealthMetricsCard';
import StreakCounter from '../../../components/StreakCounter';
import ProgressChart from '../../../components/ProgressChart';

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
        streak={topHabit?.currentStreak || 0}
      />

      {/* Habits Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Habits</Text>
      </View>

      {habits.length > 0 ? (
        habits.map(habit => (
          <View key={habit.id} style={styles.habitCard}>
            <View style={styles.habitHeader}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitProgress}>{habit.progress.toFixed(0)}%</Text>
            </View>

            <ProgressChart
              data={habit.chartData}
              habitName={habit.name}
            />

            <View style={styles.habitFooter}>
              <Text style={styles.habitStreak}>Current streak: {habit.currentStreak} days</Text>
              <Text style={styles.habitFrequency}>Frequency: {habit.frequency} times</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.noHabitsContainer}>
          <Text style={styles.noHabitsText}>No habits detected yet</Text>
          <Text style={styles.noHabitsSubtext}>Add some events to your calendar to track them</Text>
        </View>
      )}
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
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
    textAlign: 'center',
    marginBottom: 8,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  habitCard: {
    backgroundColor: 'white',
    margin: 12,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  habitProgress: {
    fontSize: 16,
    color: '#6200EE',
    fontWeight: '600',
  },
  habitFooter: {
    marginTop: 12,
  },
  habitStreak: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
  },
  habitFrequency: {
    fontSize: 14,
    color: '#666',
  },
  noHabitsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noHabitsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  noHabitsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen;
