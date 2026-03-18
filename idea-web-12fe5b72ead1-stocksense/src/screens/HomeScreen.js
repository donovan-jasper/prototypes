import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import BudgetTracker from '../components/BudgetTracker';
import MarketAlerts from '../components/MarketAlerts';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <BudgetTracker />
      <MarketAlerts marketData="Market is up 2%" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

export default HomeScreen;
