import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Discover from '../screens/Discover';
import Offline from '../screens/Offline';
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
        
