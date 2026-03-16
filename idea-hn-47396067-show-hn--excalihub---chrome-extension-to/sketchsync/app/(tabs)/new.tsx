import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { createDrawing } from '@/lib/db';

export default function NewDrawingScreen() {
  const router = useRouter();

  const createNewDrawing = async () => {
    const drawing = await createDrawing({ title: 'Untitled', data: '{}' });
    router.push(`/canvas/${drawing.id}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={createNewDrawing}>
        <Text style={styles.buttonText}>Create New Drawing</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
