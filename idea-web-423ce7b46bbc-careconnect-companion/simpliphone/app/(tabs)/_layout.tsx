import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';

export default function TabLayout() {
  const { theme } = useContext(SettingsContext);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="contacts" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Medications',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="medication" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
