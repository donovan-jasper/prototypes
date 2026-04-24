import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import InvestmentSimulator from '../components/InvestmentSimulator';
import DebtRoadmap from '../components/DebtRoadmap';
import { calculateDebtPayoffPlan } from '../utils/debt';
import { fetchUserDebtInfo } from '../utils/api';

const InsightsScreen = () => {
  const [debtData, setDebtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDebtData = async () => {
      try {
        const data = await fetchUserDebtInfo();
        setDebtData(data);
      } catch (err) {
        setError(err.message);
        Alert.alert('Error', 'Failed to load debt information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadDebtData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your financial data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading debt information: {error}</Text>
      </View>
    );
  }

  if (!debtData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No debt information available</Text>
      </View>
    );
  }

  const debtPlan = calculateDebtPayoffPlan(debtData.debts, debtData.monthlyIncome);

  return (
    <ScrollView style={styles.container}>
      <InvestmentSimulator />
      <DebtRoadmap
        debts={debtPlan.payments}
        totalDebt={debtData.totalDebt}
        monthlyIncome={debtData.monthlyIncome}
        totalPayoffMonths={debtPlan.totalPayoffMonths}
        totalInterestSaved={debtPlan.totalInterestSaved}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center'
  }
});

export default InsightsScreen;
