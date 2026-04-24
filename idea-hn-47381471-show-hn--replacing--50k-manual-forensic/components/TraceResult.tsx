import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format } from 'date-fns';
import ExportButton from './ExportButton';

interface TraceResultProps {
  result: {
    explained: boolean;
    gap: number;
    timeline: any[];
    missingTransactions: boolean;
    totalFees: number;
  };
}

const TraceResult: React.FC<TraceResultProps> = ({ result }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.title}>Trace Result</Text>
        <Text style={result.explained ? styles.success : styles.error}>
          {result.explained ? 'Balance explained' : 'Gap detected'}
        </Text>
        <Text>Gap: ${result.gap.toFixed(2)}</Text>
        <Text>Total Fees Applied: ${result.totalFees.toFixed(2)}</Text>
        {result.missingTransactions && (
          <Text style={styles.warning}>Missing transactions detected</Text>
        )}
      </View>

      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>Transaction Timeline</Text>
        {result.timeline.map((tx, index) => (
          <View key={index} style={styles.transactionRow}>
            <Text style={styles.date}>{format(new Date(tx.date), 'MM/dd/yyyy')}</Text>
            <Text style={styles.payee}>{tx.payee}</Text>
            <Text style={[
              styles.amount,
              tx.type === 'deposit' ? styles.deposit : styles.withdrawal
            ]}>
              {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
            </Text>
            {tx.fee > 0 && (
              <Text style={styles.fee}>Fee: -${tx.fee.toFixed(2)}</Text>
            )}
            <Text style={styles.balance}>Balance: ${tx.runningBalance.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {result.explained && (
        <ExportButton
          transactions={result.timeline}
          startDate={result.timeline[0]?.date}
          endDate={result.timeline[result.timeline.length - 1]?.date}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summary: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  warning: {
    color: 'orange',
    fontWeight: 'bold',
    marginTop: 8,
  },
  timeline: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  transactionRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  payee: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deposit: {
    color: 'green',
  },
  withdrawal: {
    color: 'red',
  },
  fee: {
    fontSize: 14,
    color: '#999',
  },
  balance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default TraceResult;
