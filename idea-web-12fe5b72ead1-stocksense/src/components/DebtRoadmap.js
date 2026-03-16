import React from 'react';
import { View, Text } from 'react-native';

const DebtRoadmap = ({ debtPayoffPlan }) => {
  return (
    <View>
      <Text>Debt Payoff Plan: {debtPayoffPlan}</Text>
    </View>
  );
};

export default DebtRoadmap;
