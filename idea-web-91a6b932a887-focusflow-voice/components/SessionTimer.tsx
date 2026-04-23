import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { Svg, Circle } from 'react-native-svg';

interface SessionTimerProps {
  duration: number; // in minutes
  onComplete: () => void;
  isPaused: boolean;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ duration, onComplete, isPaused }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(true);
  const [isWarning, setIsWarning] = useState(false);

  const radius = 150;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 12;
  const progress = (timeLeft / (duration * 60)) * circumference;

  useEffect(() => {
    setIsActive(!isPaused);
  }, [isPaused]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            if (interval) clearInterval(interval);
            onComplete();
            return 0;
          }

          // Trigger warning at last 30 seconds
          if (prevTime === 30) {
            setIsWarning(true);
            Vibration.vibrate([0, 500, 200, 500]);
          }

          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          stroke="#333"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          stroke={isWarning ? '#FF5252' : '#4CAF50'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </Svg>
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, isWarning && styles.warningText]}>
          {formatTime(timeLeft)}
        </Text>
        {isWarning && (
          <Text style={styles.warningMessage}>Time's up soon!</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  warningText: {
    color: '#FF5252',
  },
  warningMessage: {
    fontSize: 16,
    color: '#FF5252',
    marginTop: 10,
    fontWeight: '600',
  },
});

export default SessionTimer;
