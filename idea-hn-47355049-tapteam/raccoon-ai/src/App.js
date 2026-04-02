import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import TaskScreen from './screens/TaskScreen';
import SessionHistoryScreen from './screens/SessionHistoryScreen';
import { openDatabase } from './utils/sqlite';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    openDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TaskScreen" component={TaskScreen} />
        <Stack.Screen name="SessionHistoryScreen" component={SessionHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
