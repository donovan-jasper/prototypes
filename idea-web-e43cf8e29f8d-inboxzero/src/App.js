import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddSubscriptionScreen from './screens/AddSubscriptionScreen';
import { initDatabase, seedDatabase } from './services/SubscriptionService';
import { requestPermissions, checkUpcomingRenewals } from './services/NotificationService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddSubscription" 
        component={AddSubscriptionScreen}
        options={{ title: 'Add Subscription' }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  useEffect(() => {
    const setupApp = async () => {
      await initDatabase();
      await seedDatabase();
      await requestPermissions();
      await checkUpcomingRenewals();
    };
    setupApp();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
