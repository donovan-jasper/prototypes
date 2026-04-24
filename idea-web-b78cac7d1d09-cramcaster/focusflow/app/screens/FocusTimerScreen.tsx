import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import FocusTimer from '../components/FocusTimer';
import ProgressBar from '../components/ProgressBar';
import FocusIndicator from '../components/FocusIndicator';
import { getCalendarEvents, isEventInProgress } from '../services/calendarService';
import { registerBackgroundTask } from '../services/backgroundService';
import { registerDistractionBlocker, unregisterDistractionBlocker } from '../services/distractionBlocker';
import { blockNotifications, unblockNotifications } from '../services/notificationService';

const FocusTimerScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Calendar.Event | null>(null);
  const [isDistractionBlockingEnabled, setIsDistractionBlockingEnabled] = useState(true);
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
          await blockNotifications();
          await registerDistractionBlocker();
        } else if (!activeEvent && wasFocusActive) {
          await unblockNotifications();
          await unregisterDistractionBlocker();
        }
      } catch (error) {
        console.error('Failed to check focus status:', error);
      }
    };

    checkFocusStatus();
    const interval = setInterval(checkFocusStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isDistractionBlockingEnabled]);

  const handleComplete = () => {
    console.log('Focus session completed!');
    if (isFocusActive && isDistractionBlockingEnabled) {
      unblockNotifications();
      unregisterDistractionBlocker();
    }
  };

  const handleTimeUpdate = (timeLeft: number) => {
    const newProgress = ((duration - timeLeft) / duration) * 100;
    setProgress(newProgress);
  };

  const toggleDistractionBlocking = () => {
    setIsDistractionBlockingEnabled(!isDistractionBlockingEnabled);
    if (!isDistractionBlockingEnabled && isFocusActive) {
      blockNotifications();
      registerDistractionBlocker();
    } else if (isDistractionBlockingEnabled && isFocusActive) {
      unblockNotifications();
      unregisterDistractionBlocker();
    }
  };

  return (
    <View style={styles.container}>
      <FocusIndicator isFocusActive={isFocusActive} isDistractionBlockingActive={isFocusActive && isDistractionBlockingEnabled} />
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
        <Text style={styles.settingsLabel}>Distraction Blocking</Text>
        <Switch
          value={isDistractionBlockingEnabled}
          onValueChange={toggleDistractionBlocking}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDistractionBlockingEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  eventInfo: {
    marginVertical: 20,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  settingsLabel: {
    fontSize: 16,
  },
});

export default FocusTimerScreen;
