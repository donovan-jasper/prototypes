import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InsightCard = ({ title, value, description, percentage }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.description}>{description}</Text>
      {percentage !== undefined && (
        <Text style={[styles.percentage, percentage >= 0 ? styles.positive : styles.negative]}>
          {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  percentage: {
    fontSize: 16,
    marginTop: 8,
  },
  positive: {
    color: '#34C759',
  },
  negative: {
    color: '#FF3B30',
  },
});

export default InsightCard;
