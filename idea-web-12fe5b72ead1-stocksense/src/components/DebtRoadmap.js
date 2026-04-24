import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const DebtRoadmap = ({ debts, totalDebt, monthlyIncome }) => {
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
    const interest = (debt.amount * (debt.interestRate / 100)) * (payoffTimeMonths / 12);
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

      <ScrollView style={styles.scrollView}>
        {debts.map((debt, index) => (
          <View key={debt.id} style={styles.debtCard}>
            <View style={styles.debtHeader}>
              <Text style={styles.debtName}>{debt.name}</Text>
              <Text style={styles.interestRate}>{debt.interestRate}% APR</Text>
            </View>
            <View style={styles.debtDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balance:</Text>
                <Text style={styles.detailValue}>${debt.balance.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Minimum Payment:</Text>
                <Text style={styles.detailValue}>${debt.minimumPayment.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recommended Payment:</Text>
                <Text style={styles.detailValueHighlight}>${debt.monthlyPayment.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payoff Time:</Text>
                <Text style={styles.detailValue}>
                  {Math.ceil(debt.balance / debt.monthlyPayment)} months
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Interest Paid:</Text>
                <Text style={styles.detailValue}>
                  ${Math.round((debt.balance * (debt.interestRate / 100)) * (Math.ceil(debt.balance / debt.monthlyPayment) / 12)).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
    marginBottom: 15,
    color: '#333'
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  summaryItem: {
    width: '48%',
    marginBottom: 10
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  scrollView: {
    maxHeight: 400
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20
  },
  debtCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722'
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  debtName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  interestRate: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '600'
  },
  debtDetails: {
    marginTop: 5
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  detailLabel: {
    fontSize: 14,
    color: '#666'
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  detailValueHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32'
  }
});

export default DebtRoadmap;
