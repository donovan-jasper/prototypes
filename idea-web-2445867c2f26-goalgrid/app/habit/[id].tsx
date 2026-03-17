import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchCoachContext, generateCoachMessage } from '../../lib/ai-coach';
import { getHabitById } from '../../lib/habits';
import { calculateStreak, getLongestStreak, calculateCompletionRate, getStreakStatus } from '../../lib/streaks';
import AICoachMessage from '../../components/AICoachMessage';
import HeatMap from '../../components/HeatMap';
import StreakCounter from '../../components/StreakCounter';

export default function HabitDetailScreen() {
  const { id: habitId } = useLocalSearchParams();
  const router = useRouter();
  const [habit, setHabit] = useState(null);
  const [coachMessage, setCoachMessage] = useState('');
  const [streakContext, setStreakContext] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHabitData() {
      try {
        setIsLoading(true);

        // Get habit details
        const habitData = await getHabitById(habitId);
        setHabit(habitData);

        // Get coach context and message
        const context = await fetchCoachContext(habitData.userId, habitId);
        setStreakContext(context);

        const message = await generateCoachMessage(context);
        setCoachMessage(message);

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading habit data:', err);
        setError('Failed to load habit data');
        setIsLoading(false);
      }
    }

    if (habitId) {
      loadHabitData();
    }
  }, [habitId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Habit not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.habitName}>{habit.name}</Text>
        <Text style={styles.frequency}>{habit.frequency}</Text>
      </View>

      <View style={styles.streakSection}>
        <StreakCounter
          currentStreak={streakContext?.streakLength || 0}
          longestStreak={streakContext?.longestStreak || 0}
        />
        <Text style={styles.completionRate}>
          Completion Rate: {streakContext?.completionRate?.toFixed(0) || 0}%
        </Text>
      </View>

      <View style={styles.coachSection}>
        <Text style={styles.sectionTitle}>Your AI Coach</Text>
        {coachMessage && streakContext && (
          <AICoachMessage
            message={coachMessage}
            streakContext={{
              currentStreak: streakContext.streakLength,
              longestStreak: streakContext.longestStreak,
              habitName: streakContext.habitName,
              completionRate: streakContext.completionRate,
              status: streakContext.status
            }}
          />
        )}
      </View>

      <View style={styles.heatMapSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <HeatMap habitId={habitId} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6C63FF',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  habitName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  frequency: {
    fontSize: 16,
    color: '#666',
  },
  streakSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  completionRate: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  coachSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  heatMapSection: {
    padding: 20,
  },
});
