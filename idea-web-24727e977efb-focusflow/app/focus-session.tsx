import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, AppState, AppStateStatus, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useStore } from '../store/useStore';
import { endFocusSession } from '../lib/focus-engine';
import { blockApps, unblockApps, COMMON_APPS, requestNotificationPermissions, setupNotificationHandler, isAppBlocked, checkBlockedApps } from '../lib/app-blocker';
import { ProgressChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import * as Notifications from 'expo-notifications';

const screenWidth = Dimensions.get('window').width;

export default function FocusSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { activeSession, setActiveSession, clearActiveSession } = useStore();

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showBlockingOverlay, setShowBlockingOverlay] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    setupNotificationHandler();
    requestNotificationPermissions();
    checkBlockedApps();

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === 'active' &&
      activeSession
    ) {
      setShowBlockingOverlay(true);

      setTimeout(() => {
        setShowBlockingOverlay(false);
      }, 2000);
    }

    appStateRef.current = nextAppState;
  };

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
        setIsBlocking(true);
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

  const chartData = {
    labels: ['Progress'],
    data: [getProgress() / 100],
  };

  if (!activeSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No active session</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showBlockingOverlay && (
        <View style={styles.blockingOverlay}>
          <Text style={styles.blockingText}>Focus Mode Active</Text>
        </View>
      )}

      <View style={styles.timerContainer}>
        <ProgressChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(28, 201, 16, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          hideLegend={true}
        />
        <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.durationText}>
          {activeSession.duration} minute focus session
        </Text>

        {isBlocking && (
          <View style={styles.blockedAppsContainer}>
            <Text style={styles.blockedAppsTitle}>Blocked Apps:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {getBlockedAppNames().map((appName, index) => (
                <View key={index} style={styles.blockedAppTag}>
                  <Text style={styles.blockedAppText}>{appName}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.endButton]}
          onPress={handleEndEarly}
        >
          <Text style={styles.buttonText}>End Early</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'android' && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Note: On Android, you'll need to manually close blocked apps.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  blockingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  blockingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1cc910',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    position: 'absolute',
    top: '50%',
    marginTop: -24,
  },
  infoContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  blockedAppsContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  blockedAppsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  blockedAppTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  blockedAppText: {
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
  },
  warningText: {
    color: '#ff9800',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#1cc910',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
