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

  const finalizeEntry = async () => {
    if (!validateEntry()) return;

    setIsLoading(true);
    setError(null);

    try {
      const entry = await addEntry({
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
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Add New Entry</Text>

      {!skipPhoto && !photoUri ? (
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoButton} onPress={pickImageFromCamera}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.photoButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoButton} onPress={pickImageFromGallery}>
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.photoButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkipPhoto}>
            <Text style={styles.skipButtonText}>Skip Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          {photoUri && <Image source={{ uri: photoUri }} style={styles.previewImage} />}
          <TouchableOpacity style={styles.changePhotoButton} onPress={() => setPhotoUri(null)}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.noteInput}
        placeholder="Add a note about your entry..."
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={4}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Saving your entry...</Text>
        </View>
      )}

      {weather && (
        <View style={styles.weatherContainer}>
          <Ionicons name="partly-sunny" size={24} color="#FFC107" />
          <Text style={styles.weatherText}>
            {weather} • {temperature}°C
          </Text>
        </View>
      )}

      {location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={24} color="#2196F3" />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={finalizeEntry}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {retryCount < maxRetries && (
            <TouchableOpacity onPress={() => {
              setRetryCount(retryCount + 1);
              fetchLocationAndWeather();
            }}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
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
  photoButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  skipButton: {
    padding: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
  },
  previewContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  changePhotoButton: {
    padding: 10,
  },
  changePhotoText: {
    color: '#2196F3',
    fontSize: 14,
  },
  noteInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
  retryText: {
    color: '#d32f2f',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default AddEntryScreen;
