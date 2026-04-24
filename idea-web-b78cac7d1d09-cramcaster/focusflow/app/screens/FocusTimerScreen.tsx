import React, { useState, useEffect } from 'react';
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

const FocusTimerScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Calendar.Event | null>(null);
  const [isDistractionBlockingEnabled, setIsDistractionBlockingEnabled] = useState(true);
  const [hasScreenTimePermission, setHasScreenTimePermission] = useState(false);
  const duration = 60 * 25; // 25 minutes in seconds

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
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDistractionBlockingEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {isDistractionBlockingEnabled && (
        <View style={styles.blockingStatus}>
          <Ionicons
            name="shield-checkmark"
            size={24}
            color="#4CAF50"
            style={styles.blockingIcon}
          />
          <Text style={styles.blockingText}>Distraction blocking active</Text>
        </View>
      )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  blockingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  blockingIcon: {
    marginRight: 8,
  },
  blockingText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default FocusTimerScreen;
