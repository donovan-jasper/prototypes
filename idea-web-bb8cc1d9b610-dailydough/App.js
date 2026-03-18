import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';
import { initDatabase } from './services/database';
import DashboardScreen from './components/DashboardScreen';
import ExpenseTrackingScreen from './components/expense-tracking/ExpenseTrackingScreen';
import IncomeManagementScreen from './components/income-management/IncomeManagementScreen';
import CoachingScreen from './components/coaching/CoachingScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Expenses" component={ExpenseTrackingScreen} />
        <Tab.Screen name="Income" component={IncomeManagementScreen} />
        <Tab.Screen name="Coaching" component={CoachingScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
