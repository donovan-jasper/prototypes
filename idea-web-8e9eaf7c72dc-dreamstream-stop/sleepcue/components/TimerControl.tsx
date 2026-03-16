import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

interface TimerControlProps {
  type: 'smart' | 'manual';
}

export default function TimerControl({ type }: TimerControlProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    let interval: number | null = null;

    if (isRunning && timeLeft > 0) {
      interval = BackgroundTimer.setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer finished
      setIsRunning(false);
      // Handle timer completion (pause audio, etc.)
      console.log('Timer completed!');
    }

    return () => {
      if (interval) {
        BackgroundTimer.clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const handleAddTime = (minutes: number) => {
    setTimeLeft(prevTime => prevTime + minutes * 60);
    if (!isRunning) {
      setInitialTime(prevTime => prevTime + minutes * 60);
    }
  };

  const handleSetTime = (minutes: number) => {
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setIsRunning(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      <View style={styles.buttonContainer}>
        <Button title="+5 min" onPress={() => handleAddTime(5)} />
        <Button title="+10 min" onPress={() => handleAddTime(10)} />
        <Button title="+15 min" onPress={() => handleAddTime(15)} />
      </View>
      <View style={styles.presetContainer}>
        <Button title="15 min" onPress={() => handleSetTime(15)} />
        <Button title="30 min" onPress={() => handleSetTime(30)} />
        <Button title="45 min" onPress={() => handleSetTime(45)} />
        <Button title="60 min" onPress={() => handleSetTime(60)} />
      </View>
      <View style={styles.controlContainer}>
        <Button title={isRunning ? 'Pause' : 'Start'} onPress={isRunning ? handlePause : handleStart} />
        <Button title="Reset" onPress={handleReset} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  controlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
