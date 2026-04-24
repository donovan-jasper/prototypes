import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Switch, Alert, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FocusTimer from '../components/FocusTimer';
import ProgressBar from '../components/ProgressBar';
import FocusIndicator from '../components/FocusIndicator';
import { getCalendarEvents, isEventInProgress } from '../services/calendarService';
import { registerBackgroundTask } from '../services/backgroundService';
import {
  registerDistractionBlocker,
  unregisterDistractionBlocker,
  isDistractionBlockerActive,
  requestScreenTimePermission
} from '../services/distractionBlocker';
import { blockNotifications, unblockNotifications } from '../services/notificationService';
import { calculateFocusProgress } from '../utils/focusTimer';

const FocusTimerScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Calendar.Event | null>(null);
  const [isDistractionBlockingEnabled, setIsDistractionBlockingEnabled] = useState(true);
  const [hasScreenTimePermission, setHasScreenTimePermission] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const duration = 60 * 25; // 25 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    registerBackgroundTask();

    const checkFocusStatus = async () => {
      try {
        const currentTime = new Date();
        const events = await getCalendarEvents();
        const activeEvent = events.find(event => {
          const startDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);
          return currentTime >= startDate && currentTime <= endDate;
        });

        const wasFocusActive = isFocusActive;
        setIsFocusActive(!!activeEvent);
        setCurrentEvent(activeEvent || null);

        // Handle distraction blocking when focus state changes
        if (!!activeEvent && !wasFocusActive && isDistractionBlockingEnabled) {
          await handleEnableDistractionBlocking();
        } else if (!activeEvent && wasFocusActive) {
          await handleDisableDistractionBlocking();
        }
      } catch (error) {
        console.error('Failed to check focus status:', error);
      }
    };

    checkFocusStatus();
    const interval = setInterval(checkFocusStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isDistractionBlockingEnabled]);

  useEffect(() => {
    // Check if distraction blocker is already active
    const checkBlockerStatus = async () => {
      const isActive = await isDistractionBlockerActive();
      setIsDistractionBlockingEnabled(isActive);
    };

    checkBlockerStatus();
  }, []);

  useEffect(() => {
    if (isFocusActive) {
      // Start the timer
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newElapsed = prev + 1;
          const newProgress = calculateFocusProgress(newElapsed, duration);
          setProgress(newProgress);

          if (newElapsed >= duration) {
            handleComplete();
            return duration;
          }
          return newElapsed;
        });
      }, 1000);
    } else {
      // Reset timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
      setProgress(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isFocusActive]);

  const handleComplete = () => {
    console.log('Focus session completed!');
    if (isFocusActive && isDistractionBlockingEnabled) {
      handleDisableDistractionBlocking();
    }
  };

  const handleTimeUpdate = (timeLeft: number) => {
    const newProgress = ((duration - timeLeft) / duration) * 100;
    setProgress(newProgress);
  };

  const handleEnableDistractionBlocking = async () => {
    try {
      if (Platform.OS === 'ios' && !hasScreenTimePermission) {
        const granted = await requestScreenTimePermission();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Please enable Screen Time permission in Settings to use distraction blocking',
            [{ text: 'OK' }]
          );
          return;
        }
        setHasScreenTimePermission(true);
      }

      await blockNotifications();
      await registerDistractionBlocker();
      setIsDistractionBlockingEnabled(true);
    } catch (error) {
      console.error('Failed to enable distraction blocking:', error);
    }
  };

  const handleDisableDistractionBlocking = async () => {
    try {
      await unblockNotifications();
      await unregisterDistractionBlocker();
      setIsDistractionBlockingEnabled(false);
    } catch (error) {
      console.error('Failed to disable distraction blocking:', error);
    }
  };

  const toggleDistractionBlocking = async () => {
    if (isDistractionBlockingEnabled) {
      await handleDisableDistractionBlocking();
    } else {
      await handleEnableDistractionBlocking();
    }
  };

  return (
    <View style={styles.container}>
      <FocusIndicator
        isFocusActive={isFocusActive}
        isDistractionBlockingActive={isFocusActive && isDistractionBlockingEnabled}
      />
      {currentEvent && (
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{currentEvent.title}</Text>
          <Text style={styles.eventTime}>
            {new Date(currentEvent.startDate).toLocaleTimeString()} - {new Date(currentEvent.endDate).toLocaleTimeString()}
          </Text>
        </View>
      )}
      <FocusTimer duration={duration} onComplete={handleComplete} onTimeUpdate={handleTimeUpdate} />
      <ProgressBar progress={progress} />

      <View style={styles.settingsRow}>
        <Text style={styles.settingLabel}>Distraction Blocking</Text>
        <Switch
          value={isDistractionBlockingEnabled}
          onValueChange={toggleDistractionBlocking}
          disabled={!isFocusActive}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  eventInfo: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 16,
    color: '#666',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
});

export default FocusTimerScreen;
