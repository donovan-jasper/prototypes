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
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          textColor: '#155724',
          label: 'Bullish',
        };
      case 'bearish':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          textColor: '#721c24',
          label: 'Bearish',
        };
      case 'neutral':
        return {
          backgroundColor: '#e2e3e5',
          borderColor: '#d6d8db',
          textColor: '#383d41',
          label: 'Neutral',
        };
      default:
        return {
          backgroundColor: '#e2e3e5',
          borderColor: '#d6d8db',
          textColor: '#383d41',
          label: 'Neutral',
        };
    }
  };

  const { backgroundColor, borderColor, textColor, label } = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor, borderColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SentimentBadge;
