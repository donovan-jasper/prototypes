import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import InvestmentSimulator from '../components/InvestmentSimulator';
import DebtRoadmap from '../components/DebtRoadmap';
import { calculateDebtPayoffPlan } from '../utils/debt';

const InsightsScreen = () => {
  const sampleDebts = [
    { amount: 5000, interestRate: 18.5 },
    { amount: 12000, interestRate: 6.2 },
    { amount: 3000, interestRate: 12.0 }
  ];
  
  const monthlyIncome = 4500;
  const debtPlan = calculateDebtPayoffPlan(sampleDebts, monthlyIncome);

  return (
    <ScrollView style={styles.container}>
      <InvestmentSimulator />
      <DebtRoadmap debts={debtPlan} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

export default InsightsScreen;
