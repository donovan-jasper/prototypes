import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DailyChallengesScreen from './app/screens/DailyChallengesScreen';
import ResultsScreen from './app/screens/ResultsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DailyChallenges"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="DailyChallenges" 
          component={DailyChallengesScreen}
          options={{ title: 'Daily Challenges' }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{ title: 'Results' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
