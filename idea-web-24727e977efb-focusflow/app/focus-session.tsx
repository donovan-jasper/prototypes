import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../store/useStore';
import { endFocusSession } from '../lib/focus-engine';
import { blockApps, unblockApps, COMMON_APPS, requestNotificationPermissions, setupNotificationHandler } from '../lib/app-blocker';

export default function FocusSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { activeSession, setActiveSession, clearActiveSession } = useStore();
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setupNotificationHandler();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!activeSession && params.duration) {
      const duration = parseInt(params.duration as string, 10);
      const blockedAppsParam = params.blockedApps as string;
      const blockedAppsList = blockedAppsParam ? blockedAppsParam.split(',') : [];
      
      const newSession = {
        id: Date.now().toString(),
        duration,
        startTime: Date.now(),
        endTime: Date.now() + duration * 60 * 1000,
        blockedApps: blockedAppsList,
      };
      
      setActiveSession(newSession);
      setTimeRemaining(duration * 60);
      
      if (blockedAppsList.length > 0) {
        blockApps(blockedAppsList);
      }
    } else if (activeSession) {
      const remaining = Math.max(0, Math.floor((activeSession.endTime - Date.now()) / 1000));
      setTimeRemaining(remaining);
    }
  }, [params.duration, params.blockedApps, activeSession, setActiveSession]);

  useEffect(() => {
    if (!activeSession) return;

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((activeSession.endTime - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        handleSessionComplete();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeSession]);

  const handleSessionComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (activeSession) {
      endFocusSession(activeSession.id, true);
    }
    unblockApps();
    clearActiveSession();
    Alert.alert(
      'Session Complete!',
      'Great job staying focused!',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
    );
  };

  const handleEndEarly = () => {
    Alert.alert(
      'End Session Early?',
      'Are you sure you want to end this focus session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            if (activeSession) {
              endFocusSession(activeSession.id, false);
            }
            unblockApps();
            clearActiveSession();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!activeSession) return 0;
    const totalSeconds = activeSession.duration * 60;
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  };

  const getBlockedAppNames = (): string[] => {
    if (!activeSession || activeSession.blockedApps.length === 0) return [];
    return activeSession.blockedApps
      .map(appId => COMMON_APPS.find(app => app.id === appId)?.name)
      .filter((name): name is string => name !== undefined);
  };

  if (!activeSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No active session</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const blockedAppNames = getBlockedAppNames();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Focus Session</Text>
        <Text style={styles.durationText}>{activeSession.duration} minutes</Text>
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.progressRing}>
          <View style={[styles.progressFill, { height: `${getProgress()}%` }]} />
        </View>
        <View style={styles.timerContent}>
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          <Text style={styles.timerLabel}>remaining</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.floor(getProgress())}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.floor((activeSession.duration * 60 - timeRemaining) / 60)}
          </Text>
          <Text style={styles.statLabel}>Minutes Focused</Text>
        </View>
      </View>

      {blockedAppNames.length > 0 && (
        <View style={styles.blockedAppsSection}>
          <Text style={styles.blockedAppsTitle}>Blocked Apps</Text>
          <View style={styles.blockedAppsList}>
            {blockedAppNames.map((appName, index) => (
              <View key={index} style={styles.blockedAppChip}>
                <Text style={styles.blockedAppText}>{appName}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndEarly}
          activeOpacity={0.7}
        >
          <Text style={styles.endButtonText}>End Early</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>
          Stay present. Breathe. You've got this.
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
    marginBottom: 40,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 16,
    color: '#999',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  progressRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#fff',
    borderWidth: 8,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#6366f1',
    opacity: 0.2,
  },
  timerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  blockedAppsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  blockedAppsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  blockedAppsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  blockedAppChip: {
    backgroundColor: '#f0f0ff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  blockedAppText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  actions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  endButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  endButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  tipContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
