import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTransactions } from '../../hooks/useTransactions';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useNetWorth } from '../../hooks/useNetWorth';
import NetWorthCard from '../../components/NetWorthCard';
import SpendingChart from '../../components/SpendingChart';
import PortfolioSummary from '../../components/PortfolioSummary';
import { FloatingAction } from 'react-native-floating-action';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { portfolio, loading: portfolioLoading } = usePortfolio();
  const { netWorth, loading: netWorthLoading } = useNetWorth();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!transactionsLoading && !portfolioLoading && !netWorthLoading) {
      setIsLoading(false);
    }
  }, [transactionsLoading, portfolioLoading, netWorthLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NetWorthCard netWorth={netWorth} />
      <SpendingChart transactions={transactions} />
      <PortfolioSummary portfolio={portfolio} />
      <FloatingAction
        actions={[
          {
            text: 'Add Transaction',
            icon: require('../../assets/images/add.png'),
            name: 'add_transaction',
            position: 1,
          },
        ]}
        onPressItem={(name) => {
          if (name === 'add_transaction') {
            navigation.navigate('add-transaction');
          }
        }}
        color="#007AFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
});

export default DashboardScreen;
