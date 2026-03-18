import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InstallTracker from './components/InstallTracker';
import DeepLinkManager from './components/DeepLinkManager';
import Analytics from './components/Analytics';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="InstallTracker" component={InstallTracker} />
        <Stack.Screen name="DeepLinkManager" component={DeepLinkManager} />
        <Stack.Screen name="Analytics" component={Analytics} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
