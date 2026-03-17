import React, { useState } from 'react';
import { View, Button, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { incrementUsage } from '../store/userSlice';
import { restorePhoto } from '../services/RestorationService';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isPremium, usageCount } = useSelector((state) => state.user);
  const [isProcessing, setIsProcessing] = useState(false);

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
      setIsProcessing(true);
      
      try {
        const restoredImage = await restorePhoto(result.assets[0].uri);
        dispatch(incrementUsage());
        setIsProcessing(false);
        navigation.navigate('Result', { 
          originalImage: result.assets[0].uri,
          restoredImage: restoredImage.uri,
          quality: restoredImage.quality 
        });
      } catch (error) {
        setIsProcessing(false);
        console.error('Failed to restore photo:', error);
      }
    }
  };

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

      {isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Restoring your photo...</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Photo to Restore</Text>
        </TouchableOpacity>
      )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
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
  loadingContainer: {
    alignItems: 'center',
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
