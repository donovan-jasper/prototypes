import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';

interface SessionTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
}

const SessionTimer: React.FC<SessionTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  isPaused,
}) => {
  const progress = remainingSeconds / totalSeconds;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const radius = 120;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

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
    color: 'white',
  },
  statusText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
});

export default SessionTimer;
