import React from 'react';
import { View, Text } from 'react-native';

const MarketAlerts = ({ marketData }) => {
  return (
    <View>
      <Text>Market Data: {marketData}</Text>
    </View>
  );
};

export default MarketAlerts;
