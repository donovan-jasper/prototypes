import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getDatabase } from '../services/database';

export default function DashboardScreen() {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const db = getDatabase();
    const expenses = await db.getAllAsync('SELECT SUM(amount) as total FROM expenses');
    const income = await db.getAllAsync('SELECT SUM(amount) as total FROM income');
    
    setTotalExpenses(expenses[0]?.total || 0);
    setTotalIncome(income[0]?.total || 0);
  }

  const balance = totalIncome - totalExpenses;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Financial Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Total Income</Text>
        <Text style={styles.amount}>${totalIncome.toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Total Expenses</Text>
        <Text style={styles.amount}>${totalExpenses.toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Balance</Text>
        <Text style={[styles.amount, balance >= 0 ? styles.positive : styles.negative]}>
          ${balance.toFixed(2)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 20, marginBottom: 15, borderRadius: 10 },
  label: { fontSize: 16, color: '#666' },
  amount: { fontSize: 32, fontWeight: 'bold', marginTop: 10 },
  positive: { color: 'green' },
  negative: { color: 'red' }
});
