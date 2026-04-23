import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { cueScheduler } from '../lib/session/cueScheduler';

interface SessionTimerProps {
  sessionId: string;
  durationMinutes: number;
  onComplete: () => void;
  onInterrupt: () => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({
  sessionId,
  durationMinutes,
  onComplete,
  onInterrupt,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const totalSeconds = durationMinutes * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval!);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, onComplete]);

  useEffect(() => {
    if (isPaused) {
      cueScheduler.pause();
    } else if (isActive) {
      cueScheduler.resume();
    }
  }, [isPaused, isActive]);

  const progress = remainingSeconds / totalSeconds;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const radius = 120;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    cueScheduler.stop();
    onInterrupt();
  };

  return (
    <View style={styles.container}>
      <Svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          stroke="#3A3A3A"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          stroke="#007AFF"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={radius}
          originY={radius}
        />
      </Svg>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        {isPaused && (
          <Text style={styles.statusText}>Paused</Text>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePauseResume}
        >
          <Text style={styles.controlText}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.stopButton]}
          onPress={handleStop}
        >
          <Text style={[styles.controlText, styles.stopText]}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  timeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  statusText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 20,
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  controlText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stopText: {
    color: 'white',
  },
});

export default SessionTimer;
