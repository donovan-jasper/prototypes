import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './app/screens/HomeScreen';
import ContentDiscoveryScreen from './app/screens/ContentDiscoveryScreen';
import Reader from './app/components/Reader';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const LibraryStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Library' }} />
      <Stack.Screen name="Reader" component={Reader} />
    </Stack.Navigator>
  );
};

const DiscoverStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Discover" component={ContentDiscoveryScreen} options={{ title: 'Discover' }} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Library" component={LibraryStack} options={{ headerShown: false }} />
        <Tab.Screen name="Discover" component={DiscoverStack} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
