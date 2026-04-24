import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
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
        debts={debtPlan}
        totalDebt={debtData.totalDebt}
        monthlyIncome={debtData.monthlyIncome}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
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
