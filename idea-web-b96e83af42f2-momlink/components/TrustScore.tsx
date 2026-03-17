import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TrustScoreProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

export default function TrustScore({ score, size = 'medium' }: TrustScoreProps) {
  const getColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const sizeStyles = {
    small: { width: 32, height: 32, fontSize: 12 },
    medium: { width: 48, height: 48, fontSize: 16 },
    large: { width: 64, height: 64, fontSize: 20 },
  };

  return (
    <View style={[styles.container, { backgroundColor: getColor(), ...sizeStyles[size] }]}>
      <Text style={[styles.score, { fontSize: sizeStyles[size].fontSize }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
