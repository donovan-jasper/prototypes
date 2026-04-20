import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

interface HealthScoreProps {
  score: number;
  size?: number;
}

const HealthScore: React.FC<HealthScoreProps> = ({ score, size = 120 }) => {
  const theme = useTheme();
  const animatedScore = useRef(new Animated.Value(0)).current;
  const radius = size / 2 - 10;
  const circumference = radius * 2 * Math.PI;
  const strokeWidth = 10;

  useEffect(() => {
    Animated.timing(animatedScore, {
      toValue: score,
      duration: 1000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [score]);

  const strokeDashoffset = animatedScore.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const getColor = (score: number) => {
    if (score >= 80) return theme.colors.primary;
    if (score >= 60) return '#FFC107'; // Amber
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getMessage = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs work';
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#eee"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>

      <View style={styles.textContainer}>
        <Text variant="headlineSmall" style={styles.scoreText}>
          {Math.round(score)}
        </Text>
        <Text variant="bodySmall" style={styles.messageText}>
          {getMessage(score)}
        </Text>
      </View>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: 'bold',
  },
  messageText: {
    color: 'gray',
    marginTop: 2,
  },
});

export default HealthScore;
