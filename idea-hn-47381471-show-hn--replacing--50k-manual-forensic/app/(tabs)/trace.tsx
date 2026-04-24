import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { traceMoney } from '../../lib/trace';
import { getTransactions } from '../../lib/database';
import TraceResult from '../../components/TraceResult';

export default function TraceScreen() {
  const [startBalance, setStartBalance] = useState('');
  const [endBalance, setEndBalance] = useState('');
  const [transactionFee, setTransactionFee] = useState('');
  const [overallFee, setOverallFee] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrace = async () => {
    setLoading(true);
    try {
      const transactions = await getTransactions();
      const traceResult = traceMoney(
        parseFloat(startBalance) || 0,
        parseFloat(endBalance) || 0,
        transactions,
        0.01,
        parseFloat(transactionFee) || 0,
        parseFloat(overallFee) || 0
      );
      setResult(traceResult);
    } catch (error) {
      console.error('Trace error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Starting Balance</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={startBalance}
          onChangeText={setStartBalance}
          placeholder="0.00"
        />

        <Text style={styles.label}>Ending Balance</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={endBalance}
          onChangeText={setEndBalance}
          placeholder="0.00"
        />

        <Text style={styles.label}>Transaction Fee (per withdrawal)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={transactionFee}
          onChangeText={setTransactionFee}
          placeholder="0.00"
        />

        <Text style={styles.label}>Overall Fee</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={overallFee}
          onChangeText={setOverallFee}
          placeholder="0.00"
        />

        <Button
          title={loading ? "Tracing..." : "Trace Money"}
          onPress={handleTrace}
          disabled={loading}
        />
      </View>

      {result && (
        <View style={styles.resultContainer}>
          <TraceResult result={result} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  resultContainer: {
    marginTop: 20,
  },
});
