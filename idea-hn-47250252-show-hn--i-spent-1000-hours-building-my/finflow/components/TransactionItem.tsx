import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categories } from '../constants/Categories';

const TransactionItem = ({ transaction }) => {
  const category = categories.find((cat) => cat.name === transaction.category) || categories.find((cat) => cat.name === 'Other');

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={category.icon} size={24} color={category.color} />
      </View>
      <View style={styles.details}>
        <Text style={styles.category}>{transaction.category}</Text>
        <Text style={styles.note}>{transaction.note}</Text>
      </View>
      <Text style={[styles.amount, transaction.type === 'expense' ? styles.expense : styles.income]}>
        {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  iconContainer: {
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#8E8E93',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expense: {
    color: '#FF3B30',
  },
  income: {
    color: '#34C759',
  },
});

export default TransactionItem;
