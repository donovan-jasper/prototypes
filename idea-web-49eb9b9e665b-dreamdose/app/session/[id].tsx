import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AppState,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import SessionTimer from '@/components/SessionTimer';
import { sessionManager } from '@/lib/session/sessionManager';
import { generateSchedule, shouldTriggerCue, CueEvent } from '@/lib/audio/cueEngine';

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
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const totalSeconds = parseInt(duration as string) * 60;

  useEffect(() => {
    initializeSession();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
      }
      appState.current = nextAppState;
    });

    return () => {
      cleanup();
      subscription.remove();
    };
  }, []);

  const initializeSession = async () => {
    // Generate cue schedule
    const schedule = generateSchedule(parseInt(duration as string));
    setCueSchedule(schedule);
    
    // Load audio
    await loadAudio();
    
    // Start timer
    startTimer();
  };

  const loadAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      // Load ambient rain sound
      const { sound: ambient } = await Audio.Sound.createAsync(
        require('@/assets/sounds/rain.mp3'),
        { isLooping: true, volume: 0.6 }
      );
      setAmbientSound(ambient);
      await ambient.playAsync();

      // Load cue sound (using rain as cue for now - in production would be a different sound)
      const { sound: cue } = await Audio.Sound.createAsync(
        require('@/assets/sounds/rain.mp3'),
        { isLooping: false, volume: 0.3 }
      );
      setCueSound(cue);
    } catch (error) {
      console.error('Error loading sound:', error);
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
        
        // Check for cue triggers
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
    
    if (type === 'haptic' || type === 'both') {
      await playHapticCue(intensity);
    }
  };

  const playAudioCue = async (intensity: number) => {
    if (!cueSound) return;
    
    try {
      // Set volume based on intensity
      await cueSound.setVolumeAsync(0.3 + (intensity * 0.4)); // 0.3 to 0.7 range
      await cueSound.setPositionAsync(0);
      await cueSound.playAsync();
      
      // Stop after 2 seconds
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
        // Light: single pulse
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (intensity < 0.8) {
        // Medium: double pulse
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }, 100);
      } else {
        // Heavy: triple pulse
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 100);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 200);
      }
    } catch (error) {
      console.error('Error playing haptic cue:', error);
    }
  };

  const handlePause = () => {
    if (isPaused) {
      startTimer();
      ambientSound?.playAsync();
      setIsPaused(false);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      ambientSound?.pauseAsync();
      setIsPaused(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Stop Session?',
      'Are you sure you want to end this rest session early?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            sessionManager.interruptSession(id as string);
            cleanup();
            router.back();
          },
        },
      ]
    );
  };

  const handleSessionComplete = async () => {
    cleanup();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Play completion haptic pattern
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 0);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400);

    sessionManager.completeSession(id as string, 4);
    
    Alert.alert(
      'Session Complete! 🎉',
      'Your rest session is complete. How do you feel?',
      [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    ambientSound?.stopAsync();
    ambientSound?.unloadAsync();
    cueSound?.stopAsync();
    cueSound?.unloadAsync();
  };

  const progress = 1 - remainingSeconds / totalSeconds;
  const nextCue = cueSchedule[nextCueIndex];
  const timeUntilNextCue = nextCue 
    ? Math.floor(nextCue.timeSeconds - (totalSeconds - remainingSeconds))
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rest Session</Text>
        <Text style={styles.subtitle}>Let yourself relax</Text>

        <SessionTimer
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
          progress={progress}
        />

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.pauseButton]}
            onPress={handlePause}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStop}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>⏹️ Stop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {isPaused ? '⏸️ Paused' : '🎵 Playing rain sounds'}
          </Text>
          {!isPaused && timeUntilNextCue !== null && timeUntilNextCue > 0 && (
            <Text style={styles.cueText}>
              Next cue in {timeUntilNextCue}s
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0b0',
    marginBottom: 60,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 60,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#667eea',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBar: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#a0a0b0',
  },
  cueText: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 4,
  },
});
