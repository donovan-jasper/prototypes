import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { calculateInvestmentProjection } from '../utils/investment';

const InvestmentSimulator = () => {
  const [monthlyAmount, setMonthlyAmount] = useState('50');
  const [returnRate, setReturnRate] = useState('7');
  const [years, setYears] = useState('10');
  
  const projectedTotal = calculateInvestmentProjection(
    parseFloat(monthlyAmount) || 0,
    parseFloat(returnRate) || 0,
    parseFloat(years) || 0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Investment Simulator</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Monthly Investment ($)</Text>
        <TextInput
          style={styles.input}
          value={monthlyAmount}
          onChangeText={setMonthlyAmount}
          keyboardType="numeric"
          placeholder="50"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Annual Return Rate (%)</Text>
        <TextInput
          style={styles.input}
          value={returnRate}
          onChangeText={setReturnRate}
          keyboardType="numeric"
          placeholder="7"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Years</Text>
        <TextInput
          style={styles.input}
          value={years}
          onChangeText={setYears}
          keyboardType="numeric"
          placeholder="10"
        />
      </View>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Projected Total:</Text>
        <Text style={styles.resultValue}>${projectedTotal.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  inputGroup: {
    marginBottom: 15
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center'
  },
  resultLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5
  },
  resultValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  }
});

export default InvestmentSimulator;
