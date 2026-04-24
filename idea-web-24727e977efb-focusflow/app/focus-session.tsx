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
import * as BackgroundFetch from 'expo-background-fetch';

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

  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <ProgressChart
          data={chartData}
          width={screenWidth * 0.8}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={true}
        />
        <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
      </View>

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

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.endButton]}
          onPress={handleEndEarly}
        >
          <Text style={styles.buttonText}>End Session</Text>
        </TouchableOpacity>
      </View>

      {showBlockingOverlay && (
        <View style={styles.blockingOverlay}>
          <Text style={styles.blockingText}>Focus Session Active</Text>
          <Text style={styles.blockingSubtext}>Stay focused!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    position: 'absolute',
    top: '50%',
    marginTop: -24,
  },
  blockedAppsContainer: {
    marginTop: 40,
    width: '100%',
  },
  blockedAppsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  blockedAppTag: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  blockedAppText: {
    color: 'white',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  blockingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  blockingText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  blockingSubtext: {
    color: 'white',
    fontSize: 18,
  },
});
