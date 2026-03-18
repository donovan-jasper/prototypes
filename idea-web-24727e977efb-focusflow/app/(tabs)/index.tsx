import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { COMMON_APPS } from '../../lib/app-blocker';

const DURATION_PRESETS = [
  { label: '25 min', value: 25, description: 'Quick focus sprint' },
  { label: '50 min', value: 50, description: 'Deep work session' },
  { label: '90 min', value: 90, description: 'Extended focus block' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { activeSession } = useStore();
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

  const toggleApp = (appId: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedApps(newSelected);
  };

  const handleStartSession = () => {
    router.push({
      pathname: '/focus-session',
      params: { 
        duration: selectedDuration.toString(),
        blockedApps: Array.from(selectedApps).join(','),
      },
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
            onPress={() => setSelectedDuration(preset.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.presetLabel,
              selectedDuration === preset.value && styles.presetLabelSelected,
            ]}>
              {preset.label}
            </Text>
            <Text style={styles.presetDescription}>{preset.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Block Distracting Apps</Text>
        <Text style={styles.sectionSubtitle}>
          Select apps to block during your session
        </Text>
        
        <View style={styles.appsGrid}>
          {COMMON_APPS.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={[
                styles.appCard,
                selectedApps.has(app.id) && styles.appCardSelected,
              ]}
              onPress={() => toggleApp(app.id)}
              activeOpacity={0.7}
            >
              <View style={styles.appCardContent}>
                <Text style={[
                  styles.appName,
                  selectedApps.has(app.id) && styles.appNameSelected,
                ]}>
                  {app.name}
                </Text>
                {selectedApps.has(app.id) && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartSession}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>
          Start {selectedDuration} min Focus Session
        </Text>
        {selectedApps.size > 0 && (
          <Text style={styles.startButtonSubtext}>
            {selectedApps.size} {selectedApps.size === 1 ? 'app' : 'apps'} blocked
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          During your focus session, you'll receive gentle reminders if you try to open blocked apps.
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
    paddingBottom: 40,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
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
    gap: 12,
    marginBottom: 32,
  },
  presetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  presetCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f0ff',
  },
  presetLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  presetLabelSelected: {
    color: '#6366f1',
  },
  presetDescription: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: '48%',
    flexGrow: 1,
  },
  appCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f0ff',
  },
  appCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  appNameSelected: {
    color: '#6366f1',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  startButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  infoContainer: {
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
