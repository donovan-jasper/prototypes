import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { incrementUsage } from '../store/userSlice';
import { restorePhoto } from '../services/RestorationService';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isPremium, usageCount } = useSelector((state) => state.user);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [restoredImage, setRestoredImage] = useState(null);
  const [qualityMetrics, setQualityMetrics] = useState(null);

  const pickImage = async () => {
    if (!isPremium && usageCount >= 3) {
      navigation.navigate('Upgrade');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setRestoredImage(null);
      setQualityMetrics(null);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);

    try {
      const result = await restorePhoto(selectedImage);
      dispatch(incrementUsage());
      setRestoredImage(result.uri);
      setQualityMetrics({
        quality: result.quality,
        enhancement: result.enhancement
      });
    } catch (error) {
      console.error('Failed to restore photo:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSelection = () => {
    setSelectedImage(null);
    setRestoredImage(null);
    setQualityMetrics(null);
  };

  const saveResult = () => {
    if (!restoredImage) return;

    navigation.navigate('Result', {
      originalImage: selectedImage,
      restoredImage: restoredImage,
      quality: qualityMetrics?.quality || 0.85,
      enhancement: qualityMetrics?.enhancement || 'auto',
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Restore Your Memories</Text>
      <Text style={styles.subtitle}>
        Transform old, damaged photos into stunning images
      </Text>

      {!isPremium && (
        <Text style={styles.usageText}>
          Free restorations: {3 - usageCount} remaining
        </Text>
      )}

      {!selectedImage && (
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Photo to Restore</Text>
        </TouchableOpacity>
      )}

      {selectedImage && !restoredImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={resetSelection}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.processButton} onPress={processImage}>
              <Text style={styles.processButtonText}>Restore Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isProcessing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Restoring your photo...</Text>
        </View>
      )}

      {restoredImage && (
        <View style={styles.resultContainer}>
          <Text style={styles.sectionTitle}>Restored Photo</Text>
          <Image source={{ uri: restoredImage }} style={styles.resultImage} />

          {qualityMetrics && (
            <View style={styles.metricsContainer}>
              <Text style={styles.metricsTitle}>Quality Metrics</Text>
              <Text style={styles.metricsText}>Enhancement: {qualityMetrics.enhancement}</Text>
              <Text style={styles.metricsText}>Quality Score: {(qualityMetrics.quality * 100).toFixed(1)}%</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={resetSelection}>
              <Text style={styles.cancelButtonText}>Start Over</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.processButton} onPress={saveResult}>
              <Text style={styles.processButtonText}>Save Result</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  usageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 20,
    resizeMode: 'contain',
    backgroundColor: '#e0e0e0',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  processButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  processButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    width: '100%',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 20,
    resizeMode: 'contain',
    backgroundColor: '#e0e0e0',
  },
  metricsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  metricsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default HomeScreen;
