import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BalanceSummary({ balance }) {
  const balanceText = balance > 0 ? `You're owed $${balance.toFixed(2)}` : `You owe $${Math.abs(balance).toFixed(2)}`;

  return (
    <View style={styles.container}>
      <Text style={styles.balanceText}>{balanceText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
