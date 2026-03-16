import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import ApplicationScreen from './screens/ApplicationScreen';
import SettingsScreen from './screens/SettingsScreen';
import SchemaEvolution from './components/SchemaEvolution';
import DeterministicExecution from './components/DeterministicExecution';
import Collaboration from './components/Collaboration';
import Analytics from './components/Analytics';

const Stack = createStackNavigator();

const App = () => {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Application" component={ApplicationScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="SchemaEvolution" component={SchemaEvolution} />
          <Stack.Screen name="DeterministicExecution" component={DeterministicExecution} />
          <Stack.Screen name="Collaboration" component={Collaboration} />
          <Stack.Screen name="Analytics" component={Analytics} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
