import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Switch, Picker } from 'react-native';
import { traceMoney } from '../../lib/trace';
import { getTransactions } from '../../lib/database';
import TraceResult from '../../components/TraceResult';

export default function TraceScreen() {
  const [startBalance, setStartBalance] = useState('');
  const [endBalance, setEndBalance] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'credit card'>('checking');
  const [interestRate, setInterestRate] = useState('');
  const [includeInterest, setIncludeInterest] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const feeSchedules = [
    {
      accountType: 'checking',
      atmFee: 3.50,
      overdraftFee: 35.00,
      monthlyMaintenanceFee: 5.00
    },
    {
      accountType: 'savings',
      atmFee: 4.00,
      monthlyMaintenanceFee: 3.00
    },
    {
      accountType: 'credit card',
      foreignTransactionFee: 2.50,
      latePaymentFee: 35.00
    }
  ];

  const handleTrace = async () => {
    setLoading(true);
    try {
      const transactions = await getTransactions();

      // Add interest rate to transactions if applicable
      const processedTransactions = transactions.map(tx => ({
        ...tx,
        accountType,
        interestRate: includeInterest ? parseFloat(interestRate) || 0 : 0
      }));

      const traceResult = traceMoney(
        parseFloat(startBalance) || 0,
        parseFloat(endBalance) || 0,
        processedTransactions,
        feeSchedules,
        0.01
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

        <Text style={styles.label}>Account Type</Text>
        <Picker
          selectedValue={accountType}
          style={styles.picker}
          onValueChange={(itemValue) => setAccountType(itemValue)}
        >
          <Picker.Item label="Checking" value="checking" />
          <Picker.Item label="Savings" value="savings" />
          <Picker.Item label="Credit Card" value="credit card" />
        </Picker>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Include Interest Calculation</Text>
          <Switch
            value={includeInterest}
            onValueChange={setIncludeInterest}
          />
        </View>

        {includeInterest && (
          <>
            <Text style={styles.label}>Interest Rate (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={interestRate}
              onChangeText={setInterestRate}
              placeholder="0.00"
            />
          </>
        )}

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
  picker: {
    height: 50,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resultContainer: {
    marginTop: 20,
  },
});
