import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200EE', // A vibrant purple
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 90 : 60, // Adjust height for iOS notch
          paddingBottom: Platform.OS === 'ios' ? 25 : 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false, // Hide header for all tabs, individual screens can override
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map-marker-radius" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-hangouts"
        options={{
          title: 'My Hangouts',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar-check-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user-circle-o" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
