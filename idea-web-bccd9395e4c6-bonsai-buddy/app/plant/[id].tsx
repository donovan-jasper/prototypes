import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlants } from '../../hooks/usePlants';
import PhotoTimeline from '../../components/PhotoTimeline';
import SymptomChecker from '../../components/SymptomChecker';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { plant, loadPlant, deletePlant } = usePlants();

  useEffect(() => {
    if (id) {
      loadPlant(id as string);
    }
  }, [id]);

  const handleDelete = async () => {
    await deletePlant(id as string);
    router.back();
  };

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {plant.photoUris && plant.photoUris[0] && (
        <Image source={{ uri: plant.photoUris[0] }} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text variant="headlineMedium">{plant.name}</Text>
        <Text variant="bodyLarge">{plant.species}</Text>
        <Text variant="bodyMedium" style={styles.info}>
          Watering Frequency: Every {plant.wateringFrequency} days
        </Text>
        {plant.notes && (
          <Text variant="bodyMedium" style={styles.info}>
            Notes: {plant.notes}
          </Text>
        )}
        <PhotoTimeline photos={plant.photoUris} />
        <SymptomChecker />
        <Button mode="contained" onPress={handleDelete} style={styles.deleteButton}>
          Delete Plant
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  info: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 24,
    backgroundColor: '#d32f2f',
  },
});
