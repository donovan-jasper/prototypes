import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ScannerScreen from './screens/ScannerScreen';
import EditorScreen from './screens/EditorScreen';
import MergerScreen from './screens/MergerScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Scanner">
        <Stack.Screen name="Scanner" component={ScannerScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} />
        <Stack.Screen name="Merger" component={MergerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
