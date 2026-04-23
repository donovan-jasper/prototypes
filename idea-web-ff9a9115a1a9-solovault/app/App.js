import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CaptureScreen from './screens/CaptureScreen';
import ShareSheetHandler from './components/ShareSheetHandler';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CaptureScreen">
        <Stack.Screen
          name="CaptureScreen"
          component={CaptureScreen}
          options={{ title: 'Capture' }}
        />
      </Stack.Navigator>
      <ShareSheetHandler />
    </NavigationContainer>
  );
}
