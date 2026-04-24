import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import FocusTimer from '../components/FocusTimer';
import ProgressBar from '../components/ProgressBar';
import FocusIndicator from '../components/FocusIndicator';
import { getCalendarEvents, isEventInProgress } from '../services/calendarService';
import { registerBackgroundTask } from '../services/backgroundService';

const FocusTimerScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const duration = 60 * 25; // 25 minutes in seconds

  useEffect(() => {
    registerBackgroundTask();

    const checkFocusStatus = async () => {
      try {
        const currentTime = new Date();
        const events = await getCalendarEvents();
        const isDuringEvent = isEventInProgress(events, currentTime);
        setIsFocusActive(isDuringEvent);
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
});

export default FocusTimerScreen;
