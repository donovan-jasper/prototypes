import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfidenceIndicatorProps {
  confidence: number;
  size?: 'small' | 'medium' | 'large';
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence, size = 'medium' }) => {
  const getColor = () => {
    if (confidence >= 0.9) return '#4CAF50';
    if (confidence >= 0.7) return '#FFC107';
    return '#F44336';
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'medium': return 16;
      case 'large': return 20;
      default: return 16;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'medium': return 14;
      case 'large': return 16;
      default: return 14;
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="stats-chart"
        size={getIconSize()}
        color={getColor()}
      />
      <Text style={[styles.text, { fontSize: getTextSize(), color: getColor() }]}>
        {(confidence * 100).toFixed(0)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default ConfidenceIndicator;
