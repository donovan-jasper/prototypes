import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './app/screens/HomeScreen';
import CuratedListsScreen from './app/screens/CuratedListsScreen';

export type RootTabParamList = {
  Discover: undefined;
  Lists: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Discover') {
              iconName = focused ? 'compass' : 'compass-outline';
            } else if (route.name === 'Lists') {
              iconName = focused ? 'list' : 'list-outline';
            } else {
              iconName = 'help-outline';
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
        <Tab.Screen 
          name="Discover" 
          component={HomeScreen}
          options={{
            title: 'Discover Apps',
          }}
        />
        <Tab.Screen 
          name="Lists" 
          component={CuratedListsScreen}
          options={{
            title: 'Curated Lists',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
