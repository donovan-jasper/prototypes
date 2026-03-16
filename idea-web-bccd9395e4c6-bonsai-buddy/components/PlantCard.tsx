import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function PlantCard({ plant }: { plant: any }) {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(`/plant/${plant.id}`)}>
      <View style={styles.card}>
        {plant.photoUris && plant.photoUris[0] ? (
          <Image source={{ uri: plant.photoUris[0] }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.species}>{plant.species}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  placeholder: {
    backgroundColor: '#e0e0e0',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  species: {
    fontSize: 14,
    color: 'gray',
  },
});
