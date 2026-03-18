import { Stack } from 'expo-router';

export default function TicketLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F9F9F9',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Ticket',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Ticket Details',
        }}
      />
    </Stack>
  );
}
