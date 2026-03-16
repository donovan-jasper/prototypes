import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Builder',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="speaker" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="database" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="room"
        options={{
          title: 'Room',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="floor-plan" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
