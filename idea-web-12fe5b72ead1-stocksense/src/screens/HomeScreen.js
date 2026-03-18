import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import BudgetTracker from '../components/BudgetTracker';
import MarketAlerts from '../components/MarketAlerts';
import { calculateSpendingTrend } from '../utils/spending';
import { fetchTransactions } from '../utils/api';

const HomeScreen = () => {
  const [spendingTrend, setSpendingTrend] = useState(0);

  useEffect(() => {
    const loadTransactions = async () => {
      const transactions = await fetchTransactions();
      const trend = calculateSpendingTrend(transactions);
      setSpendingTrend(trend);
    };
    
    loadTransactions();
  }, []);

  return (
    <View>
      <Text>Home Screen</Text>
      <BudgetTracker spendingTrend={spendingTrend} />
      <MarketAlerts marketData="Market is up 2%" />
    </View>
  );
};

export default HomeScreen;
