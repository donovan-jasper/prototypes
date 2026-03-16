import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { format } from 'date-fns';
import { ExportButton } from './ExportButton';

export function TraceResult({ result, startDate, endDate }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {result.explained ? 'Money Trace Explained' : 'Gap Detected'}
      </Text>
      {!result.explained && (
        <Text style={styles.gap}>
          Unexplained gap of ${Math.abs(result.gap).toFixed(2)}
        </Text>
      )}
      <FlatList
        data={result.timeline}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionRow}>
            <Text style={styles.date}>
              {format(new Date(item.date), 'MMM dd, yyyy')}
            </Text>
            <Text style={styles.payee}>{item.payee}</Text>
            <Text style={[
              styles.amount,
              item.amount >= 0 ? styles.positive : styles.negative
            ]}>
              {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
            </Text>
          </View>
        )}
      />
      {result.explained && (
        <ExportButton
          transactions={result.timeline}
          startDate={new Date(startDate)}
          endDate={new Date(endDate)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gap: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
