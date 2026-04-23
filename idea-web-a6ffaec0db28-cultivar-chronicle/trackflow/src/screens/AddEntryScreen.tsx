import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { addEntry } from '../services/database';
import { fetchWeather } from '../services/weather';
import { useCategories } from '../hooks/useCategories';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const AddEntryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { selectedCategoryId } = useCategories();
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipPhoto, setSkipPhoto] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        visibilityTime: 3000,
      });
    }
  }, [error]);

  const validateEntry = () => {
    if (!skipPhoto && !photoUri) {
      setError('Please capture or select a photo first');
      return false;
    }
    if (!note.trim()) {
      setError('Please add a note to your entry');
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    setError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera permission is required to take photos');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
        setSkipPhoto(false);
        await fetchLocationAndWeather();
      }
    } catch (err) {
      setError('Failed to take photo. Please try again.');
    }
  };

  const pickImageFromGallery = async () => {
    setError(null);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Gallery permission is required to select photos');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
        setSkipPhoto(false);
        await fetchLocationAndWeather();
      }
    } catch (err) {
      setError('Failed to select photo. Please try again.');
    }
  };

  const fetchLocationAndWeather = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to fetch weather data');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;

      const weatherData = await fetchWeather(latitude, longitude);
      if (weatherData) {
        setWeather(weatherData.condition);
        setTemperature(weatherData.temp);
      }

      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (address) {
        setLocation(`${address.city || ''}, ${address.region || ''}`);
      }
    } catch (error) {
      console.error('Error fetching location/weather:', error);
      setError('Failed to fetch location and weather data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipPhoto = async () => {
    setSkipPhoto(true);
    setPhotoUri(null);
    await fetchLocationAndWeather();
  };

  const handleAddEntry = async () => {
    if (!validateEntry()) return;

    setIsLoading(true);
    setError(null);

    try {
      await addEntry({
        categoryId: selectedCategoryId,
        note,
        photoUri: skipPhoto ? null : photoUri,
        weather,
        temperature,
        location,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Entry added successfully!',
        visibilityTime: 2000,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error adding entry:', error);
      setError('Failed to add entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const retryFetch = async () => {
    if (retryCount >= maxRetries) {
      setError('Maximum retry attempts reached. Please check your connection and try again later.');
      return;
    }

    setIsLoading(true);
    setError(null);
    const currentRetry = retryCount + 1;
    setRetryCount(currentRetry);

    try {
      // Show retry feedback
      Toast.show({
        type: 'info',
        text1: 'Retrying...',
        text2: `Attempt ${currentRetry} of ${maxRetries}`,
        visibilityTime: 2000,
      });

      // Retry location and weather fetch
      await fetchLocationAndWeather();

      // If successful, reset retry count
      if (!error) {
        setRetryCount(0);
      }
    } catch (err) {
      console.error(`Retry attempt ${currentRetry} failed:`, err);
      if (currentRetry >= maxRetries) {
        setError('Failed to fetch data after multiple attempts. Please check your connection.');
      } else {
        setError(`Attempt ${currentRetry} failed. Retrying...`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add New Entry</Text>

        {/* Photo Section */}
        <View style={styles.photoSection}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={48} color="#999" />
              <Text style={styles.placeholderText}>No photo selected</Text>
            </View>
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={pickImageFromCamera}
              disabled={isLoading}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoButton}
              onPress={pickImageFromGallery}
              disabled={isLoading}
            >
              <Ionicons name="image" size={24} color="#fff" />
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.photoButton, styles.skipButton]}
              onPress={handleSkipPhoto}
              disabled={isLoading}
            >
              <Ionicons name="close-circle" size={24} color="#fff" />
              <Text style={styles.buttonText}>Skip Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note Section */}
        <View style={styles.noteSection}>
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Describe your entry..."
            value={note}
            onChangeText={setNote}
            editable={!isLoading}
          />
        </View>

        {/* Auto-fetched Data */}
        <View style={styles.autoDataSection}>
          <Text style={styles.sectionTitle}>Auto-Fetched Data</Text>

          <View style={styles.dataRow}>
            <Ionicons name="thermometer-outline" size={20} color="#666" />
            <Text style={styles.dataText}>
              {weather ? `${weather} (${temperature}°C)` : 'Weather data not available'}
            </Text>
            {error && (
              <TouchableOpacity onPress={retryFetch} disabled={isLoading}>
                <Ionicons name="refresh" size={20} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dataRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.dataText}>
              {location || 'Location data not available'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleAddEntry}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Entry</Text>
            )}
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  photoSection: {
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  placeholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    color: '#999',
    marginTop: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  skipButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
  },
  noteSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  autoDataSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dataText: {
    marginLeft: 10,
    flex: 1,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});

export default AddEntryScreen;
