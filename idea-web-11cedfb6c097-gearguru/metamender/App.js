import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import InventoryScreen from './app/screens/InventoryScreen';
import BuildOptimizerScreen from './app/screens/BuildOptimizerScreen';
import VendorAlertsScreen from './app/screens/VendorAlertsScreen';
import MetaTrackerScreen from './app/screens/MetaTrackerScreen';
import CommunityBuildsScreen from './app/screens/CommunityBuildsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Inventory') {
              iconName = focused ? 'cube' : 'cube-outline';
            } else if (route.name === 'Build Optimizer') {
              iconName = focused ? 'construct' : 'construct-outline';
            } else if (route.name === 'Vendor Alerts') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            } else if (route.name === 'Meta Tracker') {
              iconName = focused ? 'trending-up' : 'trending-up-outline';
            } else if (route.name === 'Community') {
              iconName = focused ? 'people' : 'people-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Inventory" component={InventoryScreen} />
        <Tab.Screen name="Build Optimizer" component={BuildOptimizerScreen} />
        <Tab.Screen name="Vendor Alerts" component={VendorAlertsScreen} />
        <Tab.Screen name="Meta Tracker" component={MetaTrackerScreen} />
        <Tab.Screen name="Community" component={CommunityBuildsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
