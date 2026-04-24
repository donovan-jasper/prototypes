import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Transaction } from '../lib/types';

interface TraceResultProps {
  result: {
    explained: boolean;
    gap: number;
    timeline: Transaction[];
    missingTransactions: boolean;
  };
  startBalance: number;
  endBalance: number;
}

const TraceResult: React.FC<TraceResultProps> = ({ result, startBalance, endBalance }) => {
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionRow}>
      <Text style={styles.date}>{item.date.toLocaleDateString()}</Text>
      <Text style={styles.payee}>{item.payee}</Text>
      <Text style={[styles.amount, item.amount >= 0 ? styles.positive : styles.negative]}>
        {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
      </Text>
      <Text style={styles.balance}>${item.runningBalance?.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Starting Balance: ${startBalance.toFixed(2)}</Text>
        <Text style={styles.summaryText}>Ending Balance: ${endBalance.toFixed(2)}</Text>
        <Text style={styles.summaryText}>Calculated Balance: ${(startBalance + result.gap).toFixed(2)}</Text>
        <Text style={[styles.summaryText, result.explained ? styles.success : styles.error]}>
          {result.explained ? 'Balance explained' : 'Balance not explained'}
        </Text>
        {result.missingTransactions && (
          <Text style={[styles.summaryText, styles.warning]}>
            Potential missing transactions detected
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Transaction Timeline</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.date]}>Date</Text>
        <Text style={[styles.headerCell, styles.payee]}>Payee</Text>
        <Text style={[styles.headerCell, styles.amount]}>Amount</Text>
        <Text style={[styles.headerCell, styles.balance]}>Balance</Text>
      </View>

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
    flex: 1,
    padding: 16,
  },
  summary: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 8,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  warning: {
    color: 'orange',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerCell: {
    fontWeight: 'bold',
  },
  date: {
    width: '25%',
  },
  payee: {
    width: '35%',
  },
  amount: {
    width: '20%',
    textAlign: 'right',
  },
  balance: {
    width: '20%',
    textAlign: 'right',
  },
  transactionRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
  transactionList: {
    maxHeight: 400,
  },
});

export default TraceResult;
