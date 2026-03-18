import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';

const DURATION_PRESETS = [
  { label: '25 min', value: 25, description: 'Quick focus sprint' },
  { label: '50 min', value: 50, description: 'Deep work session' },
  { label: '90 min', value: 90, description: 'Extended focus block' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { activeSession } = useStore();
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const handleStartSession = (duration: number) => {
    setSelectedDuration(duration);
    router.push({
      pathname: '/focus-session',
      params: { duration: duration.toString() },
    });
  };

  if (activeSession) {
    return (
      <View style={styles.container}>
        <View style={styles.activeSessionContainer}>
          <Text style={styles.activeSessionTitle}>Focus Session Active</Text>
          <Text style={styles.activeSessionText}>
            You have an active focus session running
          </Text>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => router.push('/focus-session')}
          >
            <Text style={styles.resumeButtonText}>Resume Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Start Focusing</Text>
        <Text style={styles.subtitle}>Choose your focus duration</Text>
      </View>

      <View style={styles.presetsContainer}>
        {DURATION_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.value}
            style={[
              styles.presetCard,
              selectedDuration === preset.value && styles.presetCardSelected,
            ]}
            onPress={() => handleStartSession(preset.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.presetLabel}>{preset.label}</Text>
            <Text style={styles.presetDescription}>{preset.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          During your focus session, stay present and avoid distractions. You can end early if needed.
        </Text>
      </View>
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
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  presetsContainer: {
    gap: 16,
  },
  presetCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  presetCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f0ff',
  },
  presetLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  presetDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  activeSessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  activeSessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  activeSessionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  resumeButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
