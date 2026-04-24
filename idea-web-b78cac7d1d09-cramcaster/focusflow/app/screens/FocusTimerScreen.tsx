import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FocusTimer from '../components/FocusTimer';
import ProgressBar from '../components/ProgressBar';

const FocusTimerScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const duration = 60 * 25; // 25 minutes in seconds

  const handleComplete = () => {
    console.log('Focus session completed!');
  };

  const handleTimeUpdate = (timeLeft: number) => {
    const newProgress = ((duration - timeLeft) / duration) * 100;
    setProgress(newProgress);
  };

  return (
    <View style={styles.container}>
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
