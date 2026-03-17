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
import { getUserPreferences } from '@/lib/database/queries';

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
    const prefs = await getUserPreferences();
    if (prefs) {
      setHapticsEnabled(prefs.haptic_enabled === 1);
    }

    const schedule = generateSchedule(parseInt(duration as string));
    setCueSchedule(schedule);
    
    await loadAudio();
    
    startTimer();
  };

  const loadAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
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
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }, 100);
      } else {
        await Haptics.impactAsync(Haptics.Impact
