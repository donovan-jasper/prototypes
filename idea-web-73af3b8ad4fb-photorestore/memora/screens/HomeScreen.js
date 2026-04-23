import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
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
  const [processingProgress, setProcessingProgress] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant camera roll permissions to select photos');
      }
    })();
  }, []);

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
      setProcessingProgress(0);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const result = await applyEnhancement(selectedImage, selectedEnhancement);
      clearInterval(progressInterval);
      setProcessingProgress(100);

      dispatch(incrementUsage());
      setRestoredImage(result.uri);
      setQualityMetrics({
        quality: result.quality,
        enhancement: result.enhancement
      });
    } catch (error) {
      console.error('Failed to restore photo:', error);
      Alert.alert('Error', 'Failed to restore the photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSelection = () => {
    setSelectedImage(null);
    setRestoredImage(null);
    setQualityMetrics(null);
    setSelectedEnhancement('auto');
    setProcessingProgress(0);
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
    { value: 'auto', label: 'Auto', icon: 'auto-fix-high' },
    { value: 'brighten', label: 'Brighten', icon: 'wb-sunny' },
    { value: 'sharpen', label: 'Sharpen', icon: 'filter-sharp' },
    { value: 'vintage', label: 'Vintage', icon: 'photo-camera' },
    { value: 'modern', label: 'Modern', icon: 'photo-library' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Restore Your Memories</Text>
      <Text style={styles.subtitle}>
        Transform old, damaged photos into stunning images
      </Text>

      {!isPremium && (
        <View style={styles.usageContainer}>
          <Text style={styles.usageText}>
            Free restorations: {3 - usageCount} remaining
          </Text>
          {usageCount >= 3 && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Upgrade')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          )}
        </View>
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
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${processingProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{processingProgress}%</Text>
        </View>
      )}

      {restoredImage && (
        <View style={styles.resultContainer}>
          <Text style={styles.sectionTitle}>Restored Photo</Text>
          <Image source={{ uri: restoredImage }} style={styles.resultImage} />

          {qualityMetrics && (
            <View style={styles.metricsContainer}>
              <Text style={styles.qualityText}>Quality: {(qualityMetrics.quality * 100).toFixed(0)}%</Text>
              <Text style={styles.enhancementText}>
                {enhancementOptions.find(e => e.value === qualityMetrics.enhancement)?.label || 'Auto'}
              </Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={resetSelection}>
              <Text style={styles.cancelButtonText}>Start Over</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveResult}>
              <Text style={styles.saveButtonText}>Save Result</Text>
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
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  usageContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  usageText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  upgradeButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  enhancementSelector: {
    width: '100%',
    marginBottom: 20,
  },
  enhancementLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  enhancementOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  enhancementButton: {
    paddingHorizontal: 16,
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
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  processButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  resultImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
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
  saveButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
