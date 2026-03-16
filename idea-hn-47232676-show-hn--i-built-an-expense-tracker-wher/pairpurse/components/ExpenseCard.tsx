import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExpenseCard({ expense }) {
  return (
    <View style={styles.card}>
      <Text style={styles.description}>{expense.description}</Text>
      <Text style={styles.amount}>${expense.amount.toFixed(2)}</Text>
      <Text style={styles.details}>{expense.category} • {new Date(expense.date).toLocaleDateString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 18,
    color: '#2e78b7',
    marginVertical: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
});
