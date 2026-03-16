import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';
import { usePortfolio } from '../../hooks/usePortfolio';
import InsightCard from '../../components/InsightCard';

const InsightsScreen = () => {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { portfolio, loading: portfolioLoading } = usePortfolio();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!transactionsLoading && !portfolioLoading) {
      setIsLoading(false);
    }
  }, [transactionsLoading, portfolioLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Calculate insights
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  const totalSpending = currentMonthTransactions.reduce((sum, transaction) => {
    return transaction.type === 'expense' ? sum + transaction.amount : sum;
  }, 0);

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === previousMonth &&
      transactionDate.getFullYear() === previousYear
    );
  });

  const previousMonthSpending = previousMonthTransactions.reduce((sum, transaction) => {
    return transaction.type === 'expense' ? sum + transaction.amount : sum;
  }, 0);

  const spendingDifference = totalSpending - previousMonthSpending;
  const spendingPercentage = previousMonthSpending !== 0 ? (spendingDifference / previousMonthSpending) * 100 : 0;

  const categorySpending = currentMonthTransactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    }
    return acc;
  }, {});

  const topCategory = Object.entries(categorySpending).reduce((a, b) => (a[1] > b[1] ? a : b), ['', 0]);

  const portfolioGain = portfolio.totalGain;
  const portfolioPercentGain = portfolio.totalPercentGain;

  return (
    <View style={styles.container}>
      <InsightCard
        title="Monthly Spending"
        value={`$${totalSpending.toFixed(2)}`}
        description={`You spent ${spendingPercentage >= 0 ? 'more' : 'less'} than last month`}
        percentage={spendingPercentage}
      />
      <InsightCard
        title="Top Spending Category"
        value={topCategory[0]}
        description={`You spent $${topCategory[1].toFixed(2)} on ${topCategory[0]}`}
      />
      <InsightCard
        title="Portfolio Performance"
        value={`$${portfolioGain.toFixed(2)}`}
        description={`Your portfolio is ${portfolioPercentGain >= 0 ? 'up' : 'down'} ${portfolioPercentGain.toFixed(2)}% this year`}
        percentage={portfolioPercentGain}
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

export default InsightsScreen;
