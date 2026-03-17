import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { sessionManager } from '@/lib/session/sessionManager';
import { initDatabase } from '@/lib/database/schema';
import { getUserPreferences } from '@/lib/database/queries';

const { width } = Dimensions.get('window');

const QUICK_START_DURATIONS = [10, 15, 20, 25];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedDuration, setSelectedDuration] = useState(15);

  useEffect(() => {
    loadDefaultDuration();
  }, []);

  const loadDefaultDuration = async () => {
    try {
      await initDatabase();
      const prefs = await getUserPreferences();
      if (prefs) {
        setSelectedDuration(prefs.default_duration);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleStartSession = async () => {
    const session = await sessionManager.createSession(selectedDuration, 'rain');
    await sessionManager.startSession(session.id);
    router.push(`/session/${session.id}?duration=${selectedDuration}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>RestPulse</Text>
        <Text style={styles.subtitle}>Wake up energized, not groggy</Text>
      </View>

      <View style={styles.quickStartSection}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.durationButtons}>
          {QUICK_START_DURATIONS.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                selectedDuration === duration && styles.durationButtonActive,
              ]}
              onPress={() => setSelectedDuration(duration)}
            >
              <Text
                style={[
                  styles.durationButtonText,
                  selectedDuration === duration && styles.durationButtonTextActive,
                ]}
              >
                {duration} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartSession}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.startButtonGradient}
        >
          <Text style={styles.startButtonText}>Start Rest Session</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🎵 Calming Soundscape</Text>
          <Text style={styles.infoText}>
            Gentle rain sounds to help you relax
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>⏱️ Smart Timer</Text>
          <Text style={styles.infoText}>
            Prevents deep sleep, ensures refreshed wake-up
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickStartSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: (width - 72) / 2,
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  durationButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  durationButtonTextActive: {
    color: '#667eea',
  },
  startButton: {
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  startButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoSection: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
