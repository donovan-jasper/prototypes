import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AppState,
  ActivityIndicator,
  Animated,
  Vibration,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import SessionTimer from '@/components/SessionTimer';
import { sessionManager } from '@/lib/session/sessionManager';
import { generateSchedule, shouldTriggerCue, CueEvent } from '@/lib/audio/cueEngine';
import { getUserPreferences } from '@/lib/database/queries';
import { useStore } from '@/lib/store/useStore';

export default function ActiveSessionScreen() {
  const { id, duration } = useLocalSearchParams();
  const router = useRouter();
  const [isPaused, setIsPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    parseInt(duration as string) * 60
  );
  const [ambientSound, setAmbientSound] = useState<Audio.Sound | null>(null);
  const [cueSound, setCueSound] = useState<Audio.Sound | null>(null);
  const [cueSchedule, setCueSchedule] = useState<CueEvent[]>([]);
  const [nextCueIndex, setNextCueIndex] = useState(0);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<'active' | 'paused'>('active');
  const [cueAnimation] = useState(new Animated.Value(0));

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const totalSeconds = parseInt(duration as string) * 60;
  const { currentSession, setCurrentSession } = useStore();

  useEffect(() => {
    initializeSession();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (sessionStatus === 'active' && !isPaused) {
          startTimer();
        }
      } else if (nextAppState === 'background') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      cleanup();
      subscription.remove();
    };
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);

      const prefs = await getUserPreferences();
      if (prefs) {
        setHapticsEnabled(prefs.haptic_enabled === 1);
      }

      const schedule = generateSchedule(parseInt(duration as string));
      setCueSchedule(schedule);

      await loadAudio();

      const session = await sessionManager.startSession(id as string);
      if (session) {
        setCurrentSession(session);
      }

      startTimer();
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing session:', error);
      Alert.alert('Error', 'Failed to start session. Please try again.');
      router.back();
    }
  };

  const loadAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });

      const { sound: ambient } = await Audio.Sound.createAsync(
        require('@/assets/sounds/rain.mp3'),
        { isLooping: true, volume: 0.6 }
      );
      setAmbientSound(ambient);
      await ambient.playAsync();

      const { sound: cue } = await Audio.Sound.createAsync(
        require('@/assets/sounds/rain.mp3'),
        { isLooping: false, volume: 0.3 }
      );
      setCueSound(cue);
    } catch (error) {
      console.error('Error loading sound:', error);
      setAmbientSound(null);
      setCueSound(null);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newRemaining = prev - 1;
        const elapsed = totalSeconds - newRemaining;

        checkAndTriggerCues(elapsed);

        if (newRemaining <= 0) {
          handleSessionComplete();
          return 0;
        }
        return newRemaining;
      });
    }, 1000);
  };

  const checkAndTriggerCues = (elapsedSeconds: number) => {
    if (nextCueIndex >= cueSchedule.length) return;

    const nextCue = cueSchedule[nextCueIndex];

    if (shouldTriggerCue(nextCue, elapsedSeconds)) {
      triggerCue(nextCue);
      setNextCueIndex(prev => prev + 1);
    }
  };

  const triggerCue = async (cue: CueEvent) => {
    const { type, intensity } = cue;

    // Visual feedback animation
    Animated.sequence([
      Animated.timing(cueAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cueAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Audio cue
    if (type === 'audio' || type === 'both') {
      if (cueSound) {
        await cueSound.setVolumeAsync(intensity * 0.3);
        await cueSound.replayAsync();
      }
    }

    // Haptic feedback
    if (type === 'haptic' || type === 'both') {
      if (hapticsEnabled) {
        if (intensity < 0.5) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (intensity < 0.8) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, 100);
        } else {
          Vibration.vibrate([0, 100, 50, 100, 50, 100]);
        }
      }
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      startTimer();
      setSessionStatus('active');
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setSessionStatus('paused');
    }
    setIsPaused(!isPaused);
  };

  const handleStopSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            await sessionManager.interruptSession(id as string);
            cleanup();
            router.back();
          },
        },
      ]
    );
  };

  const handleSessionComplete = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    await sessionManager.completeSession(id as string, 0); // Default rating
    cleanup();
    router.push({
      pathname: '/session/wake',
      params: { sessionId: id },
    });
  };

  const cleanup = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (ambientSound) {
      await ambientSound.stopAsync();
      await ambientSound.unloadAsync();
    }

    if (cueSound) {
      await cueSound.stopAsync();
      await cueSound.unloadAsync();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Starting your rest session...</Text>
      </View>
    );
  }

  const animatedStyle = {
    opacity: cueAnimation,
    transform: [
      {
        scale: cueAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.cueIndicator, animatedStyle]} />

      <SessionTimer
        remainingSeconds={remainingSeconds}
        totalSeconds={totalSeconds}
        isPaused={isPaused}
      />

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePauseResume}
        >
          <Text style={styles.controlButtonText}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.stopButton]}
          onPress={handleStopSession}
        >
          <Text style={[styles.controlButtonText, styles.stopButtonText]}>
            Stop
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    width: '80%',
    justifyContent: 'space-between',
  },
  controlButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  stopButtonText: {
    color: 'white',
  },
  cueIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
});
