import { Stack } from 'expo-router';
import { useStore } from '../store/useStore';

export default function RootLayout() {
  const { initializeStore } = useStore();

  // Initialize the store when the app starts
  React.useEffect(() => {
    initializeStore();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="session/active"
        options={{
          title: 'Active Session',
          headerStyle: {
            backgroundColor: '#6c5ce7',
          },
          headerTintColor: 'white',
        }}
      />
    </Stack>
  );
}
