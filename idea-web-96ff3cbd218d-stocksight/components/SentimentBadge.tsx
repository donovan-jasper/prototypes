import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SentimentBadgeProps {
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment }) => {
  const getBadgeStyle = () => {
    switch (sentiment) {
      case 'bullish':
        return {
          backgroundColor: '#e6f7ee',
          color: '#2e7d32',
          text: 'Bullish',
        };
      case 'bearish':
        return {
          backgroundColor: '#fff0f0',
          color: '#c62828',
          text: 'Bearish',
        };
      case 'neutral':
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#666',
          text: 'Neutral',
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
        {badgeStyle.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SentimentBadge;
