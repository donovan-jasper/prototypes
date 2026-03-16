import React from 'react';
import { View, Text } from 'react-native';
import DebtRoadmap from '../components/DebtRoadmap';

const InsightsScreen = () => {
  return (
    <View>
      <Text>Insights Screen</Text>
      <DebtRoadmap debtPayoffPlan="Pay off $1000 in 12 months" />
    </View>
  );
};

export default InsightsScreen;
