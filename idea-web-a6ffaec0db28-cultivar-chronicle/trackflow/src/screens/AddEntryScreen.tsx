import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { addEntry } from '../services/database';
import { fetchWeather } from '../services/weather';
import { useCategories } from '../hooks/useCategories';
import { Ionicons } from '@expo/vector-icons';

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
    if (!skipPhoto && !photoUri) {
      setError('Please capture or select a photo first');
      return;
    }

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
      navigation.goBack();
    } catch (error) {
      console.error('Error adding entry:', error);
      setError('Failed to add entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const retryFetch = async () => {
    if (photoUri || skipPhoto) {
      await fetchLocationAndWeather();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={pickImageFromCamera}>
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={pickImageFromGallery}>
          <Ionicons name="images" size={24} color="#fff" />
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkipPhoto}>
        <Ionicons name="image-outline" size={24} color="#666" />
        <Text style={styles.skipButtonText}>Skip Photo</Text>
      </TouchableOpacity>

      {photoUri && !skipPhoto && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
        </View>
      )}

      {skipPhoto && (
        <View style={styles.skipPhotoContainer}>
          <Ionicons name="image-outline" size={64} color="#ccc" />
          <Text style={styles.skipPhotoText}>No photo added</Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Fetching location and weather data...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={retryFetch} />
        </View>
      )}

      <View style={styles.noteContainer}>
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={styles.noteInput}
          multiline
          numberOfLines={4}
          placeholder="Add a note about your entry..."
          value={note}
          onChangeText={setNote}
        />
      </View>

      {weather && (
        <View style={styles.weatherContainer}>
          <Ionicons name="partly-sunny" size={24} color="#FFD700" />
          <Text style={styles.weatherText}>
            {weather} • {temperature}°C
          </Text>
        </View>
      )}

      {location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={24} color="#FF5A5F" />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, (!skipPhoto && !photoUri) && styles.disabledButton]}
        onPress={handleAddEntry}
        disabled={!skipPhoto && !photoUri}
      >
        <Text style={styles.submitButtonText}>Add Entry</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
    fontWeight: '600',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  skipButtonText: {
    color: '#666',
    marginLeft: 10,
    fontWeight: '600',
  },
  previewContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  skipPhotoContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 20,
  },
  skipPhotoText: {
    color: '#666',
    marginTop: 10,
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    padding: 15,
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 10,
  },
  noteContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherText: {
    marginLeft: 10,
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddEntryScreen;
