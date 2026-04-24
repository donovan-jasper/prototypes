import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useStore } from '../../lib/store';
import { getExpenses, getBalance } from '../../lib/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BalanceItem {
  user: string;
  amount: number;
}

export default function DashboardScreen() {
  const { expenses, syncStatus, setExpenses } = useStore();
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const expensesData = await getExpenses();
        setExpenses(expensesData);

        // Calculate balances
        // In a real app, you would get the current user's ID
        const currentUserId = 'user1'; // Replace with actual user ID
        const balanceData = await getBalance(currentUserId);
        setBalances(balanceData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [syncStatus]);

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseDescription}>{item.description}</Text>
        <Text style={styles.expenseDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
    </View>
  );

  const renderBalanceItem = ({ item }: { item: BalanceItem }) => (
    <View style={styles.balanceItem}>
      <Text style={styles.balanceUser}>{item.user}</Text>
      <Text style={[styles.balanceAmount, item.amount > 0 ? styles.positive : styles.negative]}>
        {item.amount > 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e78b7" />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Balances</Text>
        <View style={styles.syncStatus}>
          <Ionicons
            name={syncStatus === 'connected' ? 'cloud-done' :
                  syncStatus === 'syncing' ? 'sync' : 'cloud-offline'}
            size={16}
            color={syncStatus === 'connected' ? '#4CAF50' :
                  syncStatus === 'syncing' ? '#FF9800' : '#9E9E9E'}
          />
          <Text style={styles.syncStatusText}>
            {syncStatus === 'connected' ? 'Synced' :
             syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
          </Text>
        </View>
      </View>

      {balances.length > 0 ? (
        <FlatList
          data={balances}
          renderItem={renderBalanceItem}
          keyExtractor={(item) => item.user}
          style={styles.balanceList}
        />
      ) : (
        <View style={styles.emptyBalances}>
          <Text style={styles.emptyBalancesText}>No balances to show</Text>
          <Text style={styles.emptyBalancesSubtext}>Add expenses to see your balances</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/expenses')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {expenses.length > 0 ? (
          <FlatList
            data={expenses.slice(0, 5)}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id}
            style={styles.expenseList}
          />
        ) : (
          <View style={styles.emptyExpenses}>
            <Text style={styles.emptyExpensesText}>No expenses yet</Text>
            <Text style={styles.emptyExpensesSubtext}>Add your first expense to get started</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/(tabs)/add')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncStatusText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  balanceList: {
    backgroundColor: 'white',
    padding: 15,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  balanceUser: {
    fontSize: 16,
    color: '#333',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  section: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewAll: {
    color: '#2e78b7',
    fontSize: 14,
  },
  expenseList: {
    maxHeight: 300,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    color: '#333',
  },
  expenseDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyBalances: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  emptyBalancesText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  emptyBalancesSubtext: {
    fontSize: 14,
    color: '#666',
  },
  emptyExpenses: {
    padding: 20,
    alignItems: 'center',
  },
  emptyExpensesText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  emptyExpensesSubtext: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2e78b7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
