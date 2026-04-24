import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { traceMoney } from '../../lib/trace';
import { getTransactions } from '../../lib/database';
import TraceResult from '../../components/TraceResult';
import { format } from 'date-fns';

const TraceScreen = () => {
  const [startBalance, setStartBalance] = useState('');
  const [endBalance, setEndBalance] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [traceResult, setTraceResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrace = async () => {
    if (!startBalance || !endBalance) {
      Alert.alert('Error', 'Please enter both start and end balances');
      return;
    }

    setIsLoading(true);

    try {
      const startBalanceNum = parseFloat(startBalance);
      const endBalanceNum = parseFloat(endBalance);

      if (isNaN(startBalanceNum) || isNaN(endBalanceNum)) {
        Alert.alert('Error', 'Please enter valid numbers for balances');
        return;
      }

      const transactions = await getTransactions(
        new Date(startDate),
        new Date(endDate)
      );

      const result = traceMoney(startBalanceNum, endBalanceNum, transactions);
      setTraceResult(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to trace transactions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Start Balance</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={startBalance}
          onChangeText={setStartBalance}
          placeholder="0.00"
        />

        <Text style={styles.label}>End Balance</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={endBalance}
          onChangeText={setEndBalance}
          placeholder="0.00"
        />

        <Text style={styles.label}>Date Range</Text>
        <View style={styles.dateRange}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="Start Date"
          />
          <Text style={styles.dateSeparator}>to</Text>
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="End Date"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleTrace}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Tracing...' : 'Trace Transactions'}
          </Text>
        </TouchableOpacity>
      </View>

      {traceResult && (
        <TraceResult
          result={traceResult}
          startBalance={parseFloat(startBalance)}
          endBalance={parseFloat(endBalance)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  dateSeparator: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#4a6bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TraceScreen;
