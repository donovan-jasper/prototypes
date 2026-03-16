import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './(tabs)/index';
import QueriesScreen from './(tabs)/queries';
import ChartsScreen from './(tabs)/charts';
import SettingsScreen from './(tabs)/settings';

const Tab = createBottomTabNavigator();

const AppLayout = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Queries" component={QueriesScreen} />
      <Tab.Screen name="Charts" component={ChartsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AppLayout;
