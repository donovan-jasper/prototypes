import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { applyEnhancement } from '../services/RestorationService';
import { useNavigation } from '@react-navigation/native';

const RestorationScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityScore, setQualityScore] = useState(null);
  const [selectedEnhancement, setSelectedEnhancement] = useState('auto');
  const navigation = useNavigation();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setProcessedImage(null);
      setQualityScore(null);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      const result = await applyEnhancement(selectedImage, selectedEnhancement);
      setProcessedImage(result.uri);
      setQualityScore(result.quality);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const enhancementOptions = [
    { id: 'auto', label: 'Auto Enhance' },
    { id: 'brighten', label: 'Brighten' },
    { id: 'sharpen', label: 'Sharpen' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'modern', label: 'Modern' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Photo Restoration</Text>

      <View style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.enhancementOptions}>
        {enhancementOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.enhancementButton,
              selectedEnhancement === option.id && styles.selectedEnhancement
            ]}
            onPress={() => setSelectedEnhancement(option.id)}
          >
            <Text style={styles.enhancementText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={pickImage}
      >
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !selectedImage && styles.disabledButton]}
        onPress={processImage}
        disabled={!selectedImage || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Restore Photo</Text>
        )}
      </TouchableOpacity>

      {processedImage && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Restored Image</Text>
          <Image source={{ uri: processedImage }} style={styles.image} />
          {qualityScore && (
            <Text style={styles.qualityText}>
              Quality Score: {(qualityScore * 100).toFixed(1)}%
            </Text>
          )}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => navigation.navigate('Gallery', { image: processedImage })}
          >
            <Text style={styles.saveButtonText}>Save to Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
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
  enhancementOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  enhancementButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  selectedEnhancement: {
    backgroundColor: '#4CAF50',
  },
  enhancementText: {
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  qualityText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RestorationScreen;
