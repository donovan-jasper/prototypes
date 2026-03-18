import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pulse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="repositories"
        options={{
          title: 'Repositories',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="source-repository" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
