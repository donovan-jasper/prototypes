import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { startSession, userStats, selectedVoicePack } = useStore();
  const [duration, setDuration] = useState(25);

  const handleStartSession = () => {
    startSession(duration, selectedVoicePack);
    router.push('/session/active');
  };

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>Current Streak: {userStats.currentStreak} days</Text>
      </View>

      <View style={styles.durationContainer}>
        <Text style={styles.label}>Session Duration (minutes)</Text>
        <View style={styles.durationButtons}>
          {[5, 15, 25, 45].map((min) => (
            <TouchableOpacity
              key={min}
              style={[styles.durationButton, duration === min && styles.selectedDuration]}
              onPress={() => setDuration(min)}
            >
              <Text style={styles.durationText}>{min}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.customDuration}
          keyboardType="numeric"
          value={duration.toString()}
          onChangeText={(text) => setDuration(parseInt(text) || 0)}
          placeholder="Custom"
        />
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
        <Text style={styles.startButtonText}>Start Sprint</Text>
        <Ionicons name="play" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats.todayFocusTime} min</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats.weeklyFocusTime} min</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  streakContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
  },
  streakText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  durationContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#2d3436',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  durationButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#dfe6e9',
    width: '23%',
  },
  selectedDuration: {
    backgroundColor: '#6c5ce7',
  },
  durationText: {
    textAlign: 'center',
    color: '#2d3436',
  },
  customDuration: {
    borderWidth: 1,
    borderColor: '#b2bec3',
    borderRadius: 5,
    padding: 10,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6c5ce7',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
  },
});
