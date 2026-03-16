import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NetWorthCard = ({ netWorth }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Net Worth</Text>
      <Text style={styles.value}>${netWorth.toFixed(2)}</Text>
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
});

export default NetWorthCard;
