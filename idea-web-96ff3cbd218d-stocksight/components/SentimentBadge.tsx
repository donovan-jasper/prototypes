import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SentimentBadgeProps {
  sentiment: number;
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment }) => {
  const getBadgeStyle = () => {
    if (sentiment > 0.5) {
      return {
        backgroundColor: '#E6F7EE',
        color: '#2E7D32',
        text: 'Bullish',
      };
    } else if (sentiment < -0.5) {
      return {
        backgroundColor: '#FFEBEE',
        color: '#C62828',
        text: 'Bearish',
      };
    } else {
      return {
        backgroundColor: '#F5F5F5',
        color: '#616161',
        text: 'Neutral',
      };
    }
  };

  const { backgroundColor, color, text } = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SentimentBadge;
