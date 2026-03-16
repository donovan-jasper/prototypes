import React from 'react';
import { View, Text } from 'react-native';
import BudgetTracker from '../components/BudgetTracker';
import MarketAlerts from '../components/MarketAlerts';

const HomeScreen = () => {
  return (
    <View>
      <Text>Home Screen</Text>
      <BudgetTracker spendingTrend={15} />
      <MarketAlerts marketData="Market is up 2%" />
    </View>
  );
};

export default HomeScreen;
