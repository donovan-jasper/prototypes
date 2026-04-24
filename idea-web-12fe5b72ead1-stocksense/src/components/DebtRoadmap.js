import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressBar } from 'react-native-paper';

const DebtRoadmap = ({ debts, monthlyIncome, totalDebt, totalPayoffMonths, totalInterestSaved }) => {
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

  // Calculate payoff time in years and months
  const payoffYears = Math.floor(totalPayoffMonths / 12);
  const payoffMonths = totalPayoffMonths % 12;

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
          <Text style={styles.summaryLabel}>Total Interest Saved</Text>
          <Text style={styles.summaryValue}>${totalInterestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </View>
      </View>

      <View style={styles.debtsContainer}>
        <Text style={styles.sectionTitle}>Your Debts</Text>
        {debts.map((debt, index) => (
          <View key={index} style={styles.debtItem}>
            <View style={styles.debtHeader}>
              <Text style={styles.debtName}>{debt.name}</Text>
              <Text style={styles.debtAmount}>${debt.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.debtDetails}>
              <Text style={styles.debtInterest}>{debt.interestRate}% APR</Text>
              <Text style={styles.debtPayment}>Monthly Payment: ${debt.monthlyPayment.toFixed(2)}</Text>
            </View>
            <ProgressBar
              progress={debt.monthlyPayment / debt.amount}
              color="#007AFF"
              style={styles.progressBar}
            />
            <Text style={styles.debtPayoffTime}>
              Payoff Time: {Math.ceil(debt.amount / debt.monthlyPayment)} months
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>Pro Tip:</Text>
        <Text style={styles.tipText}>
          Paying off your highest-interest debt first saves you the most money over time.
        </Text>
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
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
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
    marginBottom: 5,
  },
  debtName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  debtDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  debtInterest: {
    fontSize: 14,
    color: '#FF3B30',
  },
  debtPayment: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 10,
  },
  debtPayoffTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  tipContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DebtRoadmap;
