import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { incrementUsage } from '../store/userSlice';
import { applyEnhancement } from '../services/RestorationService';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isPremium, usageCount } = useSelector((state) => state.user);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [restoredImage, setRestoredImage] = useState(null);
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [selectedEnhancement, setSelectedEnhancement] = useState('auto');

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
      const result = await applyEnhancement(selectedImage, selectedEnhancement);
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
    setSelectedEnhancement('auto');
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

  const enhancementOptions = [
    { value: 'auto', label: 'Auto' },
    { value: 'brighten', label: 'Brighten' },
    { value: 'sharpen', label: 'Sharpen' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'modern', label: 'Modern' },
  ];

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

          <View style={styles.enhancementSelector}>
            <Text style={styles.enhancementLabel}>Select Enhancement:</Text>
            <View style={styles.enhancementOptions}>
              {enhancementOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.enhancementButton,
                    selectedEnhancement === option.value && styles.selectedEnhancement
                  ]}
                  onPress={() => setSelectedEnhancement(option.value)}
                >
                  <Text style={styles.enhancementButtonText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
    textAlign: 'center',
    marginBottom: 20,
  },
  usageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  enhancementSelector: {
    width: '100%',
    marginBottom: 20,
  },
  enhancementLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  enhancementOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  enhancementButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedEnhancement: {
    backgroundColor: '#007AFF',
  },
  enhancementButtonText: {
    color: '#333',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  processButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#34C759',
    marginLeft: 10,
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    alignItems: 'center',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  metricsContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
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
