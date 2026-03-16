import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useStore } from '@/store/useStore';
import { ExerciseCard } from '@/components/ExerciseCard';
import { PremiumGate } from '@/components/PremiumGate';

export default function ExercisesScreen() {
  const { exercises, isPremium } = useStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Library</Text>
      {!isPremium && <PremiumGate />}
      <FlatList
        data={exercises}
        renderItem={({ item }) => <ExerciseCard exercise={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
