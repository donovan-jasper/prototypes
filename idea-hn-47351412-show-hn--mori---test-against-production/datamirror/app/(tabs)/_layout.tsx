import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Snapshots',
          tabBarIcon: ({ color }) => <MaterialIcons name="storage" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="query"
        options={{
          title: 'Query',
          tabBarIcon: ({ color }) => <MaterialIcons name="code" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
