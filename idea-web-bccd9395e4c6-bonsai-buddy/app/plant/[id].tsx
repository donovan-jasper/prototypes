import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlants } from '../../hooks/usePlants';
import PhotoTimeline from '../../components/PhotoTimeline';
import SymptomChecker from '../../components/SymptomChecker';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { saveImage } from '../../lib/storage';
import { updatePlant } from '../../lib/database';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { plant, loadPlant, deletePlant } = usePlants();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (id) {
      loadPlant(id as string);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleDelete = async () => {
    await deletePlant(id as string);
    router.back();
  };

  const handleTakePhoto = async () => {
    if (hasPermission === false) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const photoUri = result.assets[0].uri;
      const savedUri = await saveImage(photoUri, id as string);
      
      const updatedPhotoUris = [...(plant.photoUris || []), savedUri];
      await updatePlant(id as string, { photoUris: JSON.stringify(updatedPhotoUris) });
      
      await loadPlant(id as string);
    }
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
        <Button 
          mode="contained" 
          onPress={handleTakePhoto} 
          style={styles.photoButton}
          icon="camera"
        >
          Take Photo
        </Button>
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
  photoButton: {
    marginTop: 16,
    backgroundColor: '#4caf50',
  },
  deleteButton: {
    marginTop: 24,
    backgroundColor: '#d32f2f',
  },
});
