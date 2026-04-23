import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useStore } from '../../store/useStore';
import { useRouter } from 'expo-router';
import StreakCalendar from '../../components/StreakCalendar';

const HomeScreen = () => {
  const {
    userStats,
    selectedVoicePack,
    startSession,
    resetStreakIfNeeded,
  } = useStore();
  const router = useRouter();

  useEffect(() => {
    resetStreakIfNeeded();
  }, []);

  const handleStartSession = async (duration: number) => {
    try {
      await startSession(duration, selectedVoicePack);
      router.push('/session/active');
    } catch (error) {
      console.error('Failed to start session', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>Current Streak: {userStats.currentStreak} days</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats.totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.floor(userStats.totalFocusTime / 60)}h
          </Text>
          <Text style={styles.statLabel}>Focus Time</Text>
        </View>
      </View>

      <View style={styles.durationSelector}>
        <Text style={styles.sectionTitle}>Choose Duration</Text>
        <View style={styles.durationButtons}>
          <TouchableOpacity
            style={styles.durationButton}
            onPress={() => handleStartSession(5)}
          >
            <Text style={styles.durationText}>5 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.durationButton}
            onPress={() => handleStartSession(15)}
          >
            <Text style={styles.durationText}>15 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.durationButton, styles.selectedButton]}
            onPress={() => handleStartSession(25)}
          >
            <Text style={[styles.durationText, styles.selectedText]}>25 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.durationButton}
            onPress={() => handleStartSession(45)}
          >
            <Text style={styles.durationText}>45 min</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.voicePackSelector}>
        <Text style={styles.sectionTitle}>Voice Pack</Text>
        <Text style={styles.voicePackName}>{selectedVoicePack}</Text>
        <TouchableOpacity
          style={styles.changeButton}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.changeButtonText}>Change Voice Pack</Text>
        </TouchableOpacity>
      </View>

      <StreakCalendar currentStreak={userStats.currentStreak} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  streakContainer: {
    backgroundColor: '#4CAF50',
    padding: 16,
    alignItems: 'center',
  },
  streakText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  durationSelector: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    width: '23%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  durationText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  voicePackSelector: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  voicePackName: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  changeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
