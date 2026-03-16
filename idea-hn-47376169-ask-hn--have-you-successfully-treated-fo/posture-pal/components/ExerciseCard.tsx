import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export function ExerciseCard({ exercise }) {
  return (
    <Link href={`/exercise/${exercise.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.duration}>{exercise.duration} seconds</Text>
        <Text style={styles.difficulty}>Difficulty: {exercise.difficulty}</Text>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 16,
    color: '#666',
  },
  difficulty: {
    fontSize: 16,
    color: '#666',
  },
});
