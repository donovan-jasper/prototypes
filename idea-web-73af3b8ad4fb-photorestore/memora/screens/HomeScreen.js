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
      setSelectedEnhancement('auto');
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    
    try {
      const restoredImage = await applyEnhancement(selectedImage, selectedEnhancement);
      dispatch(incrementUsage());
      setIsProcessing(false);
      setSelectedImage(null);
      navigation.navigate('Result', { 
        originalImage: selectedImage,
        restoredImage: restoredImage.uri,
        quality: restoredImage.quality,
        enhancement: restoredImage.enhancement,
      });
    } catch (error) {
      setIsProcessing(false);
      console.error('Failed to restore photo:', error);
    }
  };

  const enhancementOptions = [
    { id: 'auto', label: 'Auto', description: 'Balanced enhancement' },
    { id: 'brighten', label: 'Brighten', description: 'Increase brightness' },
    { id: 'sharpen', label: 'Sharpen', description: 'Enhance details' },
    { id: 'vintage', label: 'Vintage', description: 'Classic film look' },
    { id: 'modern', label: 'Modern', description: 'Clean & crisp' },
  ];

  if (selectedImage) {
    return (
      <ScrollView contentContainerStyle={styles.enhancementContainer}>
        <Text style={styles.title}>Choose Enhancement Style</Text>
        
        <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        
        <View style={styles.optionsContainer}>
          {enhancementOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedEnhancement === option.id && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedEnhancement(option.id)}
            >
              <Text style={[
                styles.optionLabel,
                selectedEnhancement === option.id && styles.optionLabelSelected,
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.optionDescription,
                selectedEnhancement === option.id && styles.optionDescriptionSelected,
              ]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isProcessing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Applying {selectedEnhancement} enhancement...</Text>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.processButton} 
              onPress={processImage}
            >
              <Text style={styles.processButtonText}>Process</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restore Your Memories</Text>
      <Text style={styles.subtitle}>
        Transform old, damaged photos into stunning images
      </Text>
      
      {!isPremium && (
        <Text style={styles.usageText}>
          Free restorations: {3 - usageCount} remaining
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Select Photo to Restore</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  enhancementContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  usageText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E8F4FF',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionDescriptionSelected: {
    color: '#0066CC',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  processButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
  },
  processButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;
