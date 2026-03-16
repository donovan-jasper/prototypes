import React from 'react';
import { View, Text } from 'react-native';

const BudgetTracker = ({ spendingTrend }) => {
  return (
    <View>
      <Text>Spending Trend: ${spendingTrend}</Text>
    </View>
  );
};

export default BudgetTracker;
