import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

const GalleryScreen = () => {
  const [photos, setPhotos] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
      const imageFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'));

      const photoData = imageFiles.map((file, index) => ({
        id: index.toString(),
        uri: `${FileSystem.cacheDirectory}${file}`,
        date: new Date().toISOString(),
      }));

      setPhotos(photoData);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => navigation.navigate('Detail', { imageUri: item.uri })}
    >
      <Image source={{ uri: item.uri }} style={styles.photo} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Gallery</Text>

      {photos.length > 0 ? (
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No photos in your gallery yet</Text>
          <Text style={styles.emptySubtext}>Restore some photos to see them here</Text>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={() => navigation.navigate('Restore')}
          >
            <Text style={styles.restoreButtonText}>Go to Restoration</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    justifyContent: 'space-between',
  },
  photoContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  restoreButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GalleryScreen;
