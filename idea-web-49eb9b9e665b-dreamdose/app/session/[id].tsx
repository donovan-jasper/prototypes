import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AppState,
  ActivityIndicator,
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
        // App came to foreground
        if (sessionStatus === 'active' && !isPaused) {
          startTimer();
        }
      } else if (nextAppState === 'background') {
        // App went to background
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

      // Load user preferences
      const prefs = await getUserPreferences();
      if (prefs) {
        setHapticsEnabled(prefs.haptic_enabled === 1);
      }

      // Generate cue schedule
      const schedule = generateSchedule(parseInt(duration as string));
      setCueSchedule(schedule);

      // Load audio resources
      await loadAudio();

      // Start session in database
      const session = await sessionManager.startSession(id as string);
      if (session) {
        setCurrentSession(session);
      }

      // Start timer
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

      // Load ambient soundscape
      const { sound: ambient } = await Audio.Sound.createAsync(
        require('@/assets/sounds/rain.mp3'),
        { isLooping: true, volume: 0.6 }
      );
      setAmbientSound(ambient);
      await ambient.playAsync();

      // Load cue sound
      const { sound: cue } = await Audio.Sound.createAsync(
        require('@/assets/sounds/rain.mp3'),
        { isLooping: false, volume: 0.3 }
      );
      setCueSound(cue);
    } catch (error) {
      console.error('Error loading sound:', error);
      // Fallback to silent mode if audio fails
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

    if (type === 'audio' || type === 'both') {
      await playAudioCue(intensity);
    }

    if ((type === 'haptic' || type === 'both') && hapticsEnabled) {
      await playHapticCue(intensity);
    }
  };

  const playAudioCue = async (intensity: number) => {
    if (!cueSound) return;

    try {
      await cueSound.setVolumeAsync(0.3 + (intensity * 0.4));
      await cueSound.setPositionAsync(0);
      await cueSound.playAsync();

      setTimeout(async () => {
        await cueSound.stopAsync();
      }, 2000);
    } catch (error) {
      console.error('Error playing audio cue:', error);
    }
  };

  const playHapticCue = async (intensity: number) => {
    try {
      if (intensity < 0.5) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (intensity < 0.8) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }, 100);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }, 100);
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }, 200);
      }
    } catch (error) {
      console.error('Error playing haptic cue:', error);
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
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            await cleanup();
            await sessionManager.interruptSession(id as string);
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

    // Show completion UI
    Alert.alert(
      'Session Complete',
      'Your rest session is complete. How do you feel?',
      [
        {
          text: 'Rate Energy',
          onPress: async () => {
            // In a real app, this would show a rating UI
            const energyRating = 4; // Default rating
            await sessionManager.completeSession(id as string, energyRating);
            router.back();
          },
        },
      ],
      { cancelable: false }
    );
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

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Starting your rest session...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    padding: 20,
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
    width: '100%',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: '#1E1E1E',
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
});
