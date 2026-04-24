import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressBar } from 'react-native-paper';

const DebtRoadmap = ({ debts, monthlyIncome, totalDebt }) => {
  if (!debts || debts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Debt Payoff Roadmap</Text>
        <Text style={styles.emptyText}>No debts to display</Text>
      </View>
    );
  }

  // Calculate total monthly payment
  const totalMonthlyPayment = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);

  // Calculate payoff time in months
  const payoffTimeMonths = Math.ceil(totalDebt / totalMonthlyPayment);

  // Calculate payoff time in years and months
  const payoffYears = Math.floor(payoffTimeMonths / 12);
  const payoffMonths = payoffTimeMonths % 12;

  // Calculate total interest paid
  const totalInterest = debts.reduce((sum, debt) => {
    const interest = (debt.amount * (debt.interestRate / 100)) * (Math.ceil(debt.amount / debt.monthlyPayment) / 12);
    return sum + interest;
  }, 0);

  // Calculate savings from paying off early
  const savings = (totalInterest / (payoffTimeMonths / 12)) * (payoffTimeMonths / 12);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debt Payoff Roadmap</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Debt</Text>
          <Text style={styles.summaryValue}>${totalDebt.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Monthly Payment</Text>
          <Text style={styles.summaryValue}>${totalMonthlyPayment.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Payoff Time</Text>
          <Text style={styles.summaryValue}>
            {payoffYears > 0 ? `${payoffYears} year${payoffYears > 1 ? 's' : ''} ` : ''}
            {payoffMonths} month{payoffMonths !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Interest</Text>
          <Text style={styles.summaryValue}>${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Potential Savings</Text>
          <Text style={styles.summaryValue}>${savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </View>
      </View>

      <View style={styles.debtsContainer}>
        <Text style={styles.sectionTitle}>Your Debts</Text>
        {debts.map((debt, index) => (
          <View key={index} style={styles.debtItem}>
            <View style={styles.debtHeader}>
              <Text style={styles.debtAmount}>${debt.amount.toLocaleString()}</Text>
              <Text style={styles.debtInterest}>{debt.interestRate}% APR</Text>
            </View>
            <ProgressBar
              progress={debt.monthlyPayment / debt.amount}
              color="#007AFF"
              style={styles.progressBar}
            />
            <Text style={styles.debtPayment}>Monthly Payment: ${debt.monthlyPayment.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  debtsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  debtItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  debtAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  debtInterest: {
    fontSize: 16,
    color: '#FF3B30',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 10,
  },
  debtPayment: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DebtRoadmap;
