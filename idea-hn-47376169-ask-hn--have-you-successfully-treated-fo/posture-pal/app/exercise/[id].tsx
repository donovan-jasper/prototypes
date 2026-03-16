import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStore } from '@/store/useStore';
import { ExerciseCard } from '@/components/ExerciseCard';
import { PremiumGate } from '@/components/PremiumGate';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { exercises, isPremium, addToCustomRoutine } = useStore();
  const exercise = exercises.find((ex) => ex.id === id);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text>Exercise not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExerciseCard exercise={exercise} />
      {!isPremium && <PremiumGate />}
      {isPremium && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => addToCustomRoutine(exercise.id)}
        >
          <Text style={styles.buttonText}>Add to Custom Routine</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
