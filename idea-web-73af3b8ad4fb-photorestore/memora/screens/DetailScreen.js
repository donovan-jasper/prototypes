import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';

const DetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri } = route.params || {};
  const [imageInfo, setImageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageUri) {
      fetchImageMetadata();
    } else {
      setIsLoading(false);
    }
  }, [imageUri]);

  const fetchImageMetadata = async () => {
    try {
      const manipulatorResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { compress: 0, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Get file size from the original URI
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const fileSize = blob.size / (1024 * 1024); // Convert to MB

      setImageInfo({
        type: 'JPEG', // Default, could be enhanced to detect actual format
        dimensions: `${manipulatorResult.width}x${manipulatorResult.height}`,
        size: `${fileSize.toFixed(2)} MB`,
        dateProcessed: new Date().toLocaleDateString()
      });
    } catch (error) {
      console.error('Error fetching image metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Photo Details</Text>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text>No image available</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <View style={styles.detailsContainer}>
          {imageInfo ? (
            <>
              <Text style={styles.detailText}>File Type: {imageInfo.type}</Text>
              <Text style={styles.detailText}>Dimensions: {imageInfo.dimensions} pixels</Text>
              <Text style={styles.detailText}>Size: {imageInfo.size}</Text>
              <Text style={styles.detailText}>Date Processed: {imageInfo.dateProcessed}</Text>
            </>
          ) : (
            <Text style={styles.detailText}>Unable to load image metadata</Text>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back to Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => alert('Share functionality would be implemented here')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Share Photo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#4CAF50',
  },
  loader: {
    marginVertical: 20,
  },
});

export default DetailScreen;
