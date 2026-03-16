import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import Colors from '../constants/Colors';

const CompatibilityScore = ({ score }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (score) => {
    if (score >= 80) return Colors.success;
    if (score >= 60) return Colors.primary;
    if (score >= 40) return Colors.warning;
    return Colors.error;
  };

  return (
    <View style={styles.container}>
      <Svg height="100" width="100" viewBox="0 0 100 100">
        <Circle
          cx="50"
          cy="50"
          r={radius}
          stroke={Colors.border}
          strokeWidth="5"
          fill="transparent"
        />
        <Circle
          cx="50"
          cy="50"
          r={radius}
          stroke={getColor(score)}
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </Svg>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{score}</Text>
        <Text style={styles.label}>Compatibility</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  label: {
    fontSize: 12,
    color: Colors.text,
  },
});

export default CompatibilityScore;
