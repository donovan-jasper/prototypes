import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { traceMoney } from '@/lib/trace';
import { getTransactions } from '@/lib/database';
import { TraceResult } from '@/components/TraceResult';

export default function TraceScreen() {
  const [startBalance, setStartBalance] = useState('');
  const [endBalance, setEndBalance] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [traceResult, setTraceResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrace = async () => {
    setIsLoading(true);
    try {
      const transactions = await getTransactions(
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );

      const result = traceMoney(
        parseFloat(startBalance),
        parseFloat(endBalance),
        transactions
      );

      setTraceResult(result);
    } catch (error) {
      console.error('Error tracing money:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Starting Balance"
        keyboardType="numeric"
        value={startBalance}
        onChangeText={setStartBalance}
      />
      <TextInput
        style={styles.input}
        placeholder="Ending Balance"
        keyboardType="numeric"
        value={endBalance}
        onChangeText={setEndBalance}
      />
      <TextInput
        style={styles.input}
        placeholder="Start Date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
      />
      <TextInput
        style={styles.input}
        placeholder="End Date (YYYY-MM-DD)"
        value={endDate}
        onChangeText={setEndDate}
      />
      <Button
        title="Trace Money"
        onPress={handleTrace}
        disabled={isLoading}
      />
      {traceResult && (
        <TraceResult
          result={traceResult}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
