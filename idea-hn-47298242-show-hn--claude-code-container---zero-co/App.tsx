import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import EditorScreen from './src/screens/EditorScreen';
import OutputScreen from './src/screens/OutputScreen';
import { SessionProvider } from './src/context/SessionContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SessionProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;
              
              if (route.name === 'Editor') {
                iconName = focused ? 'code-slash' : 'code-slash-outline';
              } else {
                iconName = focused ? 'terminal' : 'terminal-outline';
              }
              
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4f46e5',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: {
              backgroundColor: '#1e293b',
              borderTopColor: '#334155',
            },
            headerStyle: {
              backgroundColor: '#1e293b',
            },
            headerTintColor: '#e2e8f0',
            headerTitleStyle: {
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen name="Editor" component={EditorScreen} />
          <Tab.Screen name="Output" component={OutputScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
}
