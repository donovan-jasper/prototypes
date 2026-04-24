import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useStore } from '../../lib/store';
import { getBalance } from '../../lib/database';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import SyncIndicator from '../../components/SyncIndicator';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const { expenses, syncStatus, pairedDevice } = useStore();
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const db = useSQLiteContext();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const users = await db.getAllAsync<{ id: string; name: string }>('SELECT id, name FROM users');
        const balanceMap: { [key: string]: number } = {};

        for (const user of users) {
          const balance = await getBalance(user.id);
          balanceMap[user.id] = balance;
        }

        setBalances(balanceMap);
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchBalances();
  }, [expenses, syncStatus]);

  const renderBalanceItem = ({ item }: { item: { id: string; name: string } }) => {
    const balance = balances[item.id] || 0;
    const isPositive = balance > 0;

    return (
      <View style={styles.balanceItem}>
        <Text style={styles.balanceName}>{item.name}</Text>
        <Text style={[styles.balanceAmount, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
          {isPositive ? '+' : ''}${Math.abs(balance).toFixed(2)}
        </Text>
      </View>
    );
  };

  const renderExpenseItem = ({ item }: { item: any }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseDescription}>{item.description}</Text>
        <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
      </View>
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.expensePayer}>Paid by: {item.paidBy}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PairPurse</Text>
        <SyncIndicator />
      </View>

      {!pairedDevice && (
        <TouchableOpacity
          style={styles.pairingPrompt}
          onPress={() => navigation.navigate('settings')}
        >
          <Ionicons name="link" size={24} color="#2e78b7" />
          <Text style={styles.pairingText}>Pair with another device to sync expenses</Text>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Balances</Text>
        {Object.keys(balances).length > 0 ? (
          <FlatList
            data={Object.entries(balances).map(([id, balance]) => ({ id, name: id, balance }))}
            renderItem={renderBalanceItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No balances to show</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('expenses')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {expenses.length > 0 ? (
          <FlatList
            data={expenses.slice(0, 5)}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No expenses yet</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.settleButton}
        onPress={() => navigation.navigate('add')}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.settleButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2e78b7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  pairingPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e3f2fd',
    margin: 20,
    borderRadius: 8,
  },
  pairingText: {
    marginLeft: 10,
    color: '#2e78b7',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    color: '#2e78b7',
    fontWeight: '500',
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  balanceName: {
    fontSize: 16,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e78b7',
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  expensePayer: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
  settleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e78b7',
    padding: 15,
    margin: 20,
    borderRadius: 8,
  },
  settleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
