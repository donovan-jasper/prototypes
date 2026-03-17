import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SessionTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
}

export default function SessionTimer({
  remainingSeconds,
  totalSeconds,
  progress,
}: SessionTimerProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        <View style={styles.progressBackground} />
        <View
          style={[
            styles.progressForeground,
            {
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                borderColor: '#667eea',
                borderWidth: 8,
                borderRadius: 120,
                width: 240,
                height: 240,
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                transform: [{ rotate: `${progress * 360}deg` }],
              },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.timeLabel}>remaining</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: '#2a2a3e',
  },
  progressForeground: {
    position: 'absolute',
    width: 240,
    height: 240,
  },
  progressBar: {
    position: 'absolute',
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    fontSize: 14,
    color: '#a0a0b0',
    marginTop: 4,
  },
});
