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
    totalInterest: number;
    recurringTransactions: any[];
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
        <Text>Total Interest Earned: ${result.totalInterest.toFixed(2)}</Text>
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
              tx.type === 'deposit' ? styles.deposit :
              tx.type === 'withdrawal' ? styles.withdrawal :
              tx.type === 'interest' ? styles.interest : styles.fee
            ]}>
              {tx.type === 'deposit' ? '+' :
               tx.type === 'withdrawal' ? '-' :
               tx.type === 'interest' ? '+' : '-'}
              ${Math.abs(tx.amount).toFixed(2)}
              {tx.type === 'withdrawal' && tx.fee > 0 && ` (Fee: $${tx.fee.toFixed(2)})`}
            </Text>
            <Text style={styles.balance}>Balance: ${tx.runningBalance.toFixed(2)}</Text>
            {tx.recurring && (
              <Text style={styles.recurring}>Recurring: {tx.recurring.frequency}</Text>
            )}
          </View>
        ))}
      </View>

      {result.recurringTransactions.length > 0 && (
        <View style={styles.recurringSection}>
          <Text style={styles.sectionTitle}>Recurring Transactions</Text>
          {result.recurringTransactions.map((tx, index) => (
            <View key={`recurring-${index}`} style={styles.transactionRow}>
              <Text style={styles.date}>{format(new Date(tx.date), 'MM/dd/yyyy')}</Text>
              <Text style={styles.payee}>{tx.payee}</Text>
              <Text style={[
                styles.amount,
                tx.type === 'deposit' ? styles.deposit : styles.withdrawal
              ]}>
                {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
              </Text>
              <Text style={styles.recurring}>Frequency: {tx.recurring.frequency}</Text>
            </View>
          ))}
        </View>
      )}

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
  interest: {
    color: 'blue',
  },
  fee: {
    color: 'purple',
  },
  balance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  recurring: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  recurringSection: {
    marginTop: 20,
    marginBottom: 20,
  },
});

export default TraceResult;
