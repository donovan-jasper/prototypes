import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';

interface SessionTimerProps {
  duration: number;
  onComplete: () => void;
  isPaused: boolean;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ duration, onComplete, isPaused }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, duration]);

  useEffect(() => {
    setProgress((timeLeft / (duration * 60)) * 100);
  }, [timeLeft, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={220} height={220} viewBox="0 0 220 220">
        <Circle
          cx="110"
          cy="110"
          r={radius}
          stroke="#dfe6e9"
          strokeWidth="10"
          fill="none"
        />
        <Circle
          cx="110"
          cy="110"
          r={radius}
          stroke="#6c5ce7"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 110 110)"
        />
      </Svg>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2d3436',
  },
});

export default SessionTimer;
