import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PaperSubmissionScreen from './screens/PaperSubmissionScreen';
import { initDatabase } from './services/database';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="SubmitPaper"
          component={PaperSubmissionScreen}
          options={{ title: 'PeerVerse' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
