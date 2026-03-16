import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { usePlants } from '../../hooks/usePlants';
import PlantCard from '../../components/PlantCard';

export default function MyPlantsScreen() {
  const router = useRouter();
  const { plants, loading, loadPlants } = usePlants();

  useEffect(() => {
    loadPlants();
  }, []);

  return (
    <View style={styles.container}>
      {plants.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text variant="headlineMedium">Add your first plant!</Text>
        </View>
      ) : (
        <FlatList
          data={plants}
          renderItem={({ item }) => <PlantCard plant={item} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/plant/add')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
