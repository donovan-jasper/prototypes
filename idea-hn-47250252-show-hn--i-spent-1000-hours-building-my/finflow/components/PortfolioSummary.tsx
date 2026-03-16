import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PortfolioSummary = ({ portfolio }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Portfolio</Text>
      <Text style={styles.value}>${portfolio.totalValue.toFixed(2)}</Text>
      <Text style={[styles.gain, portfolio.totalGain >= 0 ? styles.positive : styles.negative]}>
        {portfolio.totalGain >= 0 ? '+' : ''}${portfolio.totalGain.toFixed(2)} ({portfolio.totalPercentGain.toFixed(2)}%)
      </Text>
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
  gain: {
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

export default PortfolioSummary;
