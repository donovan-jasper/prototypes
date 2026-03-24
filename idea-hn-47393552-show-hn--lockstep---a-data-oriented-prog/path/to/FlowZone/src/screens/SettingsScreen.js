import React from 'react';
import { View, Text } from 'react-native';
import DataSourceIntegrator from '../components/DataSourceIntegrator';

const SettingsScreen = () => {
  return (
    <View>
      <Text>Settings Screen</Text>
      <DataSourceIntegrator />
    </View>
  );
};

export default SettingsScreen;
