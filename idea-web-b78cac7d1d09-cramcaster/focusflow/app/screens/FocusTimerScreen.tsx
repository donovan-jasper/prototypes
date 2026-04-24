import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import FocusTimer from '../components/FocusTimer';
import ProgressBar from '../components/ProgressBar';
import FocusIndicator from '../components/FocusIndicator';
import { getCalendarEvents, isEventInProgress } from '../services/calendarService';
import { registerBackgroundTask } from '../services/backgroundService';

const FocusTimerScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Calendar.Event | null>(null);
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

        setIsFocusActive(!!activeEvent);
        setCurrentEvent(activeEvent || null);
      } catch (error) {
        console.error('Failed to check focus status:', error);
      }
    };

    checkFocusStatus();
    const interval = setInterval(checkFocusStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleComplete = () => {
    console.log('Focus session completed!');
  };

  const handleTimeUpdate = (timeLeft: number) => {
    const newProgress = ((duration - timeLeft) / duration) * 100;
    setProgress(newProgress);
  };

  return (
    <View style={styles.container}>
      <FocusIndicator isFocusActive={isFocusActive} />
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
});

export default FocusTimerScreen;
