import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../../store/useStore';
import { useNavigation } from '@react-navigation/native';
import { scheduleDailyReminder, checkAndScheduleStreakReminder } from '../../lib/notifications';
import { format } from 'date-fns';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userStats, startSession, selectedVoicePack, resetStreakIfNeeded } = useStore();
  const [selectedDuration, setSelectedDuration] = useState(25);

  useEffect(() => {
    // Check for streak reminder when screen loads
    checkAndScheduleStreakReminder();

    // Reset streak if needed when screen loads
    resetStreakIfNeeded();
  }, []);

  const handleStartSession = async () => {
    await startSession(selectedDuration, selectedVoicePack);
    navigation.navigate('session/active');
  };

  const handleSetReminder = async () => {
    // For demo purposes, set reminder for 10 minutes from now
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes() + 10;

    await scheduleDailyReminder(hour, minute);
    alert(`Reminder set for ${hour}:${minute < 10 ? '0' + minute : minute}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>Current Streak: {userStats.currentStreak} days</Text>
        <Text style={styles.streakSubtext}>Longest: {userStats.longestStreak} days</Text>
      </View>

      <View style={styles.durationSelector}>
        <Text style={styles.sectionTitle}>Session Duration</Text>
        <View style={styles.durationButtons}>
          {[5, 15, 25, 45].map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                selectedDuration === duration && styles.selectedDurationButton,
              ]}
              onPress={() => setSelectedDuration(duration)}
            >
              <Text style={[
                styles.durationButtonText,
                selectedDuration === duration && styles.selectedDurationButtonText,
              ]}>
                {duration} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
        <Text style={styles.startButtonText}>Start Sprint</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Today's Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.totalFocusTime} min</Text>
            <Text style={styles.statLabel}>Focus Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.reminderButton} onPress={handleSetReminder}>
        <Text style={styles.reminderButtonText}>Set Daily Reminder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  streakContainer: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  streakText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  streakSubtext: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  durationSelector: {
    marginBottom: 20,
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedDurationButton: {
    backgroundColor: '#4CAF50',
  },
  durationButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDurationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  reminderButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  reminderButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default HomeScreen;
