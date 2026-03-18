import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Discover from '../screens/Discover';
import Settings from '../screens/Settings';
import AddArticle from '../screens/AddArticle';
import ArticleView from '../screens/ArticleView';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddArticle" 
        component={AddArticle}
        options={{ title: 'Add Article' }}
      />
      <Stack.Screen 
        name="ArticleView" 
        component={ArticleView}
        options={{ title: 'Article' }}
      />
    </Stack.Navigator>
  );
};

const DiscoverStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="DiscoverMain" 
        component={Discover}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ArticleView" 
        component={ArticleView}
        options={{ title: 'Article' }}
      />
    </Stack.Navigator>
  );
};

const SettingsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SettingsMain" 
        component={Settings}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStack}
          options={{
            tabBarLabel: 'Saved',
          }}
        />
        <Tab.Screen 
          name="Discover" 
          component={DiscoverStack}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsStack}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
