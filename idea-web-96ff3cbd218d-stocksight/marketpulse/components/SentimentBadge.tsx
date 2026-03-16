import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SentimentBadgeProps {
  sentiment: number;
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment }) => {
  let backgroundColor;
  let text;

  if (sentiment > 0.5) {
    backgroundColor = 'green';
    text = 'Bullish';
  } else if (sentiment < -0.5) {
    backgroundColor = 'red';
    text = 'Bearish';
  } else {
    backgroundColor = 'gray';
    text = 'Neutral';
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{text}</Text>
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
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SentimentBadge;
