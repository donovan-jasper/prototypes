import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import InventoryScreen from './screens/InventoryScreen';
import TradeScreen from './screens/TradeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inventory">
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="Trade" component={TradeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
