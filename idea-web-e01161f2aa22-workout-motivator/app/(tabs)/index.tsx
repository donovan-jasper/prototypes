import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../lib/store';
import { getUserStats, UserStats } from '../../lib/database';
import StreakCalendar from '../../components/StreakCalendar';

const COACHES = [
  { id: 'drill-sergeant', name: 'Drill Sergeant', emoji: '🎖️', description: 'No excuses, soldier!' },
  { id: 'zen-master', name: 'Zen Master', emoji: '🧘', description: 'Find your inner peace' },
  { id: 'best-friend', name: 'Best Friend', emoji: '🤗', description: 'You got this, buddy!' },
  { id: 'comedian', name: 'Comedian', emoji: '😂', description: 'Laugh your way through it' },
  { id: 'stoic', name: 'Stoic Philosopher', emoji: '🏛️', description: 'Embrace the challenge' },
];

export default function HomeScreen() {
  const [taskName, setTaskName] = useState('');
  const [selectedCoach, setSelectedCoach] = useState(COACHES[0].id);
  const [stats, setStats] = useState<UserStats>({ totalXP: 0, streakFreezeTokens: 1, currentStreak: 0 });
  const router = useRouter();
  const startSession = useSessionStore((state) => state.startSession);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const userStats = await getUserStats();
    setStats(userStats);
  };

  const handleStartSession = () => {
    if (!taskName.trim()) {
      return;
    }

    const sessionId = Date.now().toString();
    startSession(sessionId, taskName.trim(), selectedCoach);
    router.push(`/session/${sessionId}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>MotiveMate</Text>
        <Text style={styles.subtitle}>Your personal hype coach</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue}>{stats.totalXP}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>🧊</Text>
          <Text style={styles.statValue}>{stats.streakFreezeTokens}</Text>
          <Text style={styles.statLabel}>Freeze Tokens</Text>
        </View>
      </View>

      <View style={styles.section}>
        <StreakCalendar />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>What are you working on?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Study for exam, Clean kitchen, Write report"
          value={taskName}
          onChangeText={setTaskName}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Choose your coach</Text>
        <View style={styles.coachGrid}>
          {COACHES.map((coach) => (
            <TouchableOpacity
              key={coach.id}
              style={[
                styles.coachCard,
                selectedCoach === coach.id && styles.coachCardSelected,
              ]}
              onPress={() => setSelectedCoach(coach.id)}
            >
              <Text style={styles.coachEmoji}>{coach.emoji}</Text>
              <Text style={styles.coachName}>{coach.name}</Text>
              <Text style={styles.coachDescription}>{coach.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.startButton, !taskName.trim() && styles.startButtonDisabled]}
        onPress={handleStartSession}
        disabled={!taskName.trim()}
      >
        <Text style={styles.startButtonText}>Start Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  coachGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  coachCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  coachCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  coachEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  coachName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  coachDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
