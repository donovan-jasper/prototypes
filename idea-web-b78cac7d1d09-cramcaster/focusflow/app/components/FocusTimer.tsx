import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FocusTimerProps {
  duration: number;
  onComplete: () => void;
  onTimeUpdate: (timeLeft: number) => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ duration, onComplete, onTimeUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete();
      setIsRunning(false);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleTimer}>
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FocusTimer;
