import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-transaction" options={{ title: 'Add Transaction' }} />
      <Stack.Screen name="add-holding" options={{ title: 'Add Holding' }} />
      <Stack.Screen name="holding-detail" options={{ title: 'Holding Details' }} />
      <Stack.Screen name="edit-holding" options={{ title: 'Edit Holding' }} />
    </Stack>
  );
}
