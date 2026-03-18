import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSessionStore } from '../../lib/store';
import SessionTimer from '../../components/SessionTimer';

const COACHES = {
  'drill-sergeant': { name: 'Drill Sergeant', emoji: '🎖️' },
  'zen-master': { name: 'Zen Master', emoji: '🧘' },
  'best-friend': { name: 'Best Friend', emoji: '🤗' },
  'comedian': { name: 'Comedian', emoji: '😂' },
  'stoic': { name: 'Stoic Philosopher', emoji: '🏛️' },
};

export default function SessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { taskName, coachId, isActive, stopSession, reset } = useSessionStore();

  const coach = COACHES[coachId as keyof typeof COACHES];

  const handleEndSession = () => {
    stopSession();
    reset();
    router.push('/');
  };

  if (!taskName || !coach) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.coachEmoji}>{coach.emoji}</Text>
        <Text style={styles.coachName}>{coach.name}</Text>
      </View>

      <View style={styles.taskContainer}>
        <Text style={styles.taskLabel}>Current Task</Text>
        <Text style={styles.taskName}>{taskName}</Text>
      </View>

      <SessionTimer />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
          <Text style={styles.endButtonText}>End Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  coachEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  coachName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  taskContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  taskLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  endButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
});
