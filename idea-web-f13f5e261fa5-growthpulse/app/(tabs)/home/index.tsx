import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { fetchHealthData, initializeHealthKit, initializeGoogleFit } from '../../../lib/healthService';
import { fetchCalendarEvents, identifyHabitsFromEvents } from '../../../lib/calendarService';
import { calculateStreak } from '../../../lib/habitTracker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface HealthStats {
  steps: number;
  sleep: number;
  workouts: number;
}

interface SyncStatus {
  health: 'synced' | 'syncing' | 'failed';
  calendar: 'synced' | 'syncing' | 'failed';
}

const HomeScreen = () => {
  const [healthData, setHealthData] = useState<HealthStats | null>(null);
  const [habits, setHabits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    health: 'synced',
    calendar: 'synced'
  });
  const [streak, setStreak] = useState(0);
  const navigation = useNavigation();

  const syncData = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, health: 'syncing', calendar: 'syncing' }));

      const [health, events] = await Promise.all([
        fetchHealthData(),
        fetchCalendarEvents()
      ]);

      setHealthData(health);
      const detectedHabits = identifyHabitsFromEvents(events);
      setHabits(detectedHabits);

      // Calculate streak based on detected habits
      const habitDates = events
        .filter(event => detectedHabits.some(habit => event.title.toLowerCase().includes(habit)))
        .map(event => event.startDate.toISOString().split('T')[0]);

      setStreak(calculateStreak(habitDates));

      setSyncStatus({ health: 'synced', calendar: 'synced' });
    } catch (err) {
      setError('Failed to sync data. Please check permissions.');
      setSyncStatus({ health: 'failed', calendar: 'failed' });
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await initializeHealthKit();
        await initializeGoogleFit();
        await syncData();
      } catch (err) {
        setError('Failed to initialize services. Please check permissions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeServices();
  }, [syncData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncData();
    setRefreshing(false);
  }, [syncData]);

  const getSyncIcon = (status: 'synced' | 'syncing' | 'failed') => {
    switch (status) {
      case 'synced':
        return <Ionicons name="checkmark-circle" size={20} color="#34C759" />;
      case 'syncing':
        return <ActivityIndicator size="small" color="#FF9500" />;
      case 'failed':
        return <Ionicons name="alert-circle" size={20} color="#FF3B30" />;
      default:
        return null;
    }
  };

  const navigateToJournal = () => {
    navigation.navigate('journal');
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={syncData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>ProgressPulse</Text>
        <Text style={styles.subtitle}>Your daily health and habits summary</Text>
      </View>

      <View style={styles.dashboard}>
        <View style={styles.streakContainer}>
          <Text style={styles.streakLabel}>Today's Streak</Text>
          <Text style={styles.streakValue}>{streak} days</Text>
          <Text style={styles.streakDescription}>
            {streak > 0 ? 'Keep it up!' : 'Start your habit streak today!'}
          </Text>
        </View>

        <View style={styles.habitsSummary}>
          <Text style={styles.sectionTitle}>Detected Habits</Text>
          {habits.length > 0 ? (
            <View style={styles.habitList}>
              {habits.map((habit, index) => (
                <View key={index} style={styles.habitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  <Text style={styles.habitText}>{habit}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noHabitsText}>No habits detected yet. Add some to your calendar!</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.quickCheckinButton}
          onPress={navigateToJournal}
        >
          <Ionicons name="pencil" size={20} color="white" />
          <Text style={styles.quickCheckinText}>Quick Check-in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.syncStatusContainer}>
        <View style={styles.syncStatusItem}>
          <Text style={styles.syncStatusLabel}>Health Data</Text>
          {getSyncIcon(syncStatus.health)}
        </View>
        <View style={styles.syncStatusItem}>
          <Text style={styles.syncStatusLabel}>Calendar</Text>
          {getSyncIcon(syncStatus.calendar)}
        </View>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={syncData}
          disabled={syncStatus.health === 'syncing' || syncStatus.calendar === 'syncing'}
        >
          <Ionicons name="refresh" size={16} color="white" />
          <Text style={styles.syncButtonText}>Sync Now</Text>
        </TouchableOpacity>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
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
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  dashboard: {
    padding: 20,
  },
  streakContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  streakDescription: {
    fontSize: 14,
    color: '#666',
  },
  habitsSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  habitList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  habitText: {
    marginLeft: 5,
    color: '#007AFF',
  },
  noHabitsText: {
    color: '#666',
    fontSize: 14,
  },
  quickCheckinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  quickCheckinText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  syncStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  syncStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncStatusLabel: {
    marginRight: 5,
    color: '#666',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  syncButtonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  metricBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default HomeScreen;
