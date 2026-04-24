import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { format } from 'date-fns';

const TraceResult = ({ result, startBalance, endBalance }) => {
  const renderTransaction = ({ item }) => {
    const isDeposit = item.amount > 0;
    return (
      <View style={styles.transactionRow}>
        <Text style={styles.transactionDate}>
          {format(new Date(item.date), 'MMM dd, yyyy')}
        </Text>
        <Text style={styles.transactionPayee}>{item.payee}</Text>
        <Text style={[styles.transactionAmount, isDeposit ? styles.deposit : styles.withdrawal]}>
          {isDeposit ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>
          {result.explained ? 'Balance Explained' : 'Gap Detected'}
        </Text>
        <Text style={styles.summaryBalance}>
          Start: ${startBalance.toFixed(2)} → End: ${endBalance.toFixed(2)}
        </Text>
        {result.explained ? (
          <Text style={styles.successText}>
            All transactions account for the balance change.
          </Text>
        ) : (
          <Text style={styles.warningText}>
            Unexplained gap of ${Math.abs(result.gap).toFixed(2)} detected.
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Transaction Timeline</Text>
      <FlatList
        data={result.timeline}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.transactionList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summary: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  summaryBalance: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  successText: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  transactionList: {
    maxHeight: 300,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  transactionPayee: {
    fontSize: 16,
    flex: 1,
    marginHorizontal: 10,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
    textAlign: 'right',
  },
  deposit: {
    color: '#2ecc71',
  },
  withdrawal: {
    color: '#e74c3c',
  },
});

export default TraceResult;
