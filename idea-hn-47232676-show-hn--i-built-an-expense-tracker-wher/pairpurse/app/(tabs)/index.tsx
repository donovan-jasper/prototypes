import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getExpenses, getBalance } from '../../lib/database';
import ExpenseCard from '../../components/ExpenseCard';
import BalanceSummary from '../../components/BalanceSummary';
import SyncIndicator from '../../components/SyncIndicator';

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const expensesData = await getExpenses();
      setExpenses(expensesData.slice(0, 5));

      const balanceData = await getBalance('user1', 'user2');
      setBalance(balanceData);
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <BalanceSummary balance={balance} />
      <SyncIndicator />
      <Text style={styles.sectionTitle}>Recent Expenses</Text>
      <FlatList
        data={expenses}
        renderItem={({ item }) => <ExpenseCard expense={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
});
