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
                    styles.enhancementOption,
                    selectedEnhancement === option.value && styles.selectedEnhancement
                  ]}
                  onPress={() => setSelectedEnhancement(option.value)}
                >
                  <Text style={styles.enhancementOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.processButton]}
            onPress={processImage}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? 'Restoring...' : 'Restore Photo'}
            </Text>
          </TouchableOpacity>

          {isProcessing && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.progressText}>{processingProgress}%</Text>
            </View>
          )}
        </View>
      )}

      {restoredImage && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Restored Image</Text>
          <Image source={{ uri: restoredImage }} style={styles.resultImage} />

          <View style={styles.metricsContainer}>
            <Text style={styles.metricText}>
              Quality: {Math.round(qualityMetrics?.quality * 100)}%
            </Text>
            <Text style={styles.metricText}>
              Enhancement: {qualityMetrics?.enhancement}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={resetSelection}
            >
              <Text style={styles.buttonText}>Start Over</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={saveResult}
            >
              <Text style={styles.buttonText}>Save & Share</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  usageContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  usageText: {
    fontSize: 16,
    color: '#1976d2',
    marginBottom: 8,
  },
  upgradeButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContainer: {
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
  enhancementSelector: {
    marginBottom: 20,
  },
  enhancementLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  enhancementOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  enhancementOption: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  selectedEnhancement: {
    backgroundColor: '#4CAF50',
  },
  enhancementOptionText: {
    color: '#333',
  },
  processButton: {
    backgroundColor: '#2196F3',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  progressText: {
    marginLeft: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
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
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  metricText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    backgroundColor: '#f44336',
    flex: 1,
    marginRight: 10,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 10,
  },
});

export default HomeScreen;
