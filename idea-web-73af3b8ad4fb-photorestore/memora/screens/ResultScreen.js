import React from 'react';
import { View, Image, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { saveRestoration } from '../services/StorageService';

const ResultScreen = ({ route, navigation }) => {
  const { originalImage, restoredImage, quality, enhancement } = route.params;

  const enhancementLabels = {
    auto: 'Auto Enhancement',
    brighten: 'Brightened',
    sharpen: 'Sharpened',
    vintage: 'Vintage Style',
    modern: 'Modern Style',
  };

  const handleSave = async () => {
    const restoration = {
      id: Date.now().toString(),
      originalUri: originalImage,
      restoredUri: restoredImage,
      quality: quality,
      enhancement: enhancement,
      timestamp: Date.now(),
    };

    const success = await saveRestoration(restoration);
    
    if (success) {
      Alert.alert(
        'Saved!',
        'Your restored photo has been saved to the gallery.',
        [
          {
            text: 'View Gallery',
            onPress: () => navigation.navigate('Gallery', { screen: 'GalleryList' }),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to save the photo. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Restoration Complete!</Text>
      <View style={styles.infoRow}>
        <Text style={styles.qualityText}>Quality: {(quality * 100).toFixed(0)}%</Text>
        <Text style={styles.enhancementText}>{enhancementLabels[enhancement] || enhancement}</Text>
      </View>
      
      <View style={styles.imageSection}>
        <Text style={styles.label}>Original</Text>
        <Image source={{ uri: originalImage }} style={styles.image} />
      </View>

      <View style={styles.imageSection}>
        <Text style={styles.label}>Restored</Text>
        <Image source={{ uri: restoredImage }} style={styles.image} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save to Gallery</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  qualityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  enhancementText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  imageSection: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ResultScreen;
