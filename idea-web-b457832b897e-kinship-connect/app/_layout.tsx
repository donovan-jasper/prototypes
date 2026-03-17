import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="match/[id]" options={{ title: 'Match Detail' }} />
        <Stack.Screen name="call/[connectionId]" options={{ title: 'Call' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
      </Stack>
    </AuthProvider>
  );
}
