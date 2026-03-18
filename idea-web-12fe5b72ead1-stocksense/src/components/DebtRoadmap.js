import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const DebtRoadmap = ({ debts }) => {
  if (!debts || debts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Debt Payoff Roadmap</Text>
        <Text style={styles.emptyText}>No debts to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debt Payoff Roadmap</Text>
      <ScrollView style={styles.scrollView}>
        {debts.map((debt, index) => (
          <View key={index} style={styles.debtCard}>
            <View style={styles.debtHeader}>
              <Text style={styles.debtName}>Debt #{index + 1}</Text>
              <Text style={styles.interestRate}>{debt.interestRate}% APR</Text>
            </View>
            <View style={styles.debtDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>${debt.amount.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Monthly Payment:</Text>
                <Text style={styles.detailValueHighlight}>${debt.monthlyPayment.toFixed(2)}</Text>
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
    color: '#333',
    fontWeight: '500'
  },
  detailValueHighlight: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold'
  }
});

export default DebtRoadmap;
