import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { format } from 'date-fns';

export function TransactionRow({ transaction }) {
  return (
    <View style={styles.row}>
      <Image
        source={{ uri: transaction.documentUri }}
        style={styles.thumbnail}
      />
      <View style={styles.info}>
        <Text style={styles.date}>
          {format(new Date(transaction.date), 'MMM dd, yyyy')}
        </Text>
        <Text style={styles.payee}>{transaction.payee}</Text>
      </View>
      <Text style={[
        styles.amount,
        transaction.amount >= 0 ? styles.positive : styles.negative
      ]}>
        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  thumbnail: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  payee: {
    fontSize: 14,
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
});
