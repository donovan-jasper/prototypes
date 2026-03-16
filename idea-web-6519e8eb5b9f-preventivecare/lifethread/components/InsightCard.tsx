import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InsightCard = ({ insight }) => {
  const getEmoji = () => {
    if (insight.strength > 0.7) return 'ðŸ”¥';
    if (insight.strength > 0.5) return 'ðŸ˜Š';
    if (insight.strength > 0.3) return 'ðŸ˜Œ';
    return 'ðŸ¤”';
  };

  return (
    <View style={styles.card}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{getEmoji()}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.insight}>{insight.insight}</Text>
        <Text style={styles.correlation}>
          Correlation: {Math.round(insight.strength * 100)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  emojiContainer: {
    marginRight: 16,
  },
  emoji: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  insight: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  correlation: {
    fontSize: 14,
    color: '#666',
  },
});

export default InsightCard;
