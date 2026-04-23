import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          icon: 'trending-up',
        };
      case 'bearish':
        return {
          backgroundColor: '#fff0f0',
          color: '#c62828',
          text: 'Bearish',
          icon: 'trending-down',
        };
      case 'neutral':
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#666',
          text: 'Neutral',
          icon: 'remove',
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
      <Ionicons
        name={badgeStyle.icon}
        size={12}
        color={badgeStyle.color}
        style={styles.icon}
      />
      <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
        {badgeStyle.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  icon: {
    marginRight: 2,
  },
});

export default SentimentBadge;
