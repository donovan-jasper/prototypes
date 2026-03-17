import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from './store';
import HomeScreen from './screens/HomeScreen';
import GalleryScreen from './screens/GalleryScreen';
import UpgradeScreen from './screens/UpgradeScreen';
import ResultScreen from './screens/ResultScreen';
import DetailScreen from './screens/DetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function RestoreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="RestoreHome" 
        component={HomeScreen}
        options={{ title: 'Restore' }}
      />
      <Stack.Screen 
        name="Result" 
        component={ResultScreen}
        options={{ title: 'Result' }}
      />
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen}
        options={{ title: 'Photo Detail' }}
      />
    </Stack.Navigator>
  );
}

function GalleryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="GalleryList" 
        component={GalleryScreen}
        options={{ title: 'Gallery' }}
      />
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen}
        options={{ title: 'Photo Detail' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Restore" 
        component={RestoreStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Gallery" 
        component={GalleryStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Upgrade" 
            component={UpgradeScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
