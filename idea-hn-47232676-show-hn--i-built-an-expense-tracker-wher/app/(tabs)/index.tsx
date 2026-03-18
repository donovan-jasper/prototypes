import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getExpenses, getBalance } from '../../lib/database';
import ExpenseCard from '../../components/ExpenseCard';
import BalanceSummary from '../../components/BalanceSummary';
import SyncIndicator from '../../components/SyncIndicator';

export default function Dashboard() {
  const db = useSQLiteContext();
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const expensesData = await getExpenses(db);
        setExpenses(expensesData.slice(0, 5));

        const balanceData = await getBalance(db, 'user1', 'user2');
        setBalance(balanceData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [db]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2e78b7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BalanceSummary balance={balance} />
      <SyncIndicator />
      <Text style={styles.sectionTitle}>Recent Expenses</Text>
      {expenses.length === 0 ? (
        <Text style={styles.emptyText}>No expenses yet. Add your first expense!</Text>
      ) : (
        <FlatList
          data={expenses}
          renderItem={({ item }) => <ExpenseCard expense={item} />}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
});
