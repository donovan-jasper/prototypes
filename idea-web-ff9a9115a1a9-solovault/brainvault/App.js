import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import CaptureScreen from './app/components/CaptureScreen';
import ChannelScreen from './app/components/ChannelScreen';
import SearchScreen from './app/components/SearchScreen';
import { initDB as initStorageDB } from './app/utils/storage';
import { initDB as initChannelDB } from './app/utils/channel';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    initStorageDB();
    initChannelDB();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Capture"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Capture') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Channels') {
              iconName = focused ? 'folder' : 'folder-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
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
          name="Capture" 
          component={CaptureScreen}
          options={{ title: 'Capture' }}
        />
        <Tab.Screen 
          name="Channels" 
          component={ChannelScreen}
          options={{ title: 'Channels' }}
        />
        <Tab.Screen 
          name="Search" 
          component={SearchScreen}
          options={{ title: 'Search' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
