import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function ProjectLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]/index" options={{ title: 'Project Editor', headerShown: false }} />
      {/* Add other project-related screens here, e.g., preview.tsx, export.tsx */}
    </Stack>
  );
}
