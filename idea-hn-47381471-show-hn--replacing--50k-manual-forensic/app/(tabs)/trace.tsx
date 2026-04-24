import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { traceMoney } from '../../lib/trace';
import { getTransactions } from '../../lib/database';
import TraceResult from '../../components/TraceResult';

const TraceScreen = () => {
  const [startBalance, setStartBalance] = useState('');
  const [endBalance, setEndBalance] = useState('');
  const [tolerance, setTolerance] = useState('0.01');
  const [fee, setFee] = useState('');
  const [traceResult, setTraceResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrace = async () => {
    if (!startBalance || !endBalance) {
      Alert.alert('Error', 'Please enter both start and end balances');
      return;
    }

    setIsLoading(true);

    try {
      const transactions = await getTransactions();
      const result = traceMoney(
        parseFloat(startBalance),
        parseFloat(endBalance),
        transactions,
        parseFloat(tolerance),
        parseFloat(fee) || 0
      );

      setTraceResult({
        ...result,
        startBalance: parseFloat(startBalance),
        endBalance: parseFloat(endBalance),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to trace transactions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deterministic Trace</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Starting Balance</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={startBalance}
          onChangeText={setStartBalance}
          placeholder="0.00"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ending Balance</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={endBalance}
          onChangeText={setEndBalance}
          placeholder="0.00"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tolerance (default: 0.01)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={tolerance}
          onChangeText={setTolerance}
          placeholder="0.01"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Transaction Fee (optional)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={fee}
          onChangeText={setFee}
          placeholder="0.00"
        />
      </View>

      <Button
        title={isLoading ? 'Tracing...' : 'Trace Transactions'}
        onPress={handleTrace}
        disabled={isLoading}
      />

      {traceResult && (
        <TraceResult
          result={traceResult}
          startBalance={traceResult.startBalance}
          endBalance={traceResult.endBalance}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
});

export default TraceScreen;
