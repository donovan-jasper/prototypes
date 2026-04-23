import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
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

  const handleAddEntry = async () => {
    if (!photoUri) {
      setError('Please capture or select a photo first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addEntry({
        categoryId: selectedCategoryId,
        note,
        photoUri,
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
    if (photoUri) {
      await fetchLocationAndWeather();
    }
  };

  return (
    <View style={styles.container}>
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

      {photoUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Fetching weather data...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {weather && !isLoading && !error && (
        <View style={styles.weatherInfo}>
          <View style={styles.weatherItem}>
            <Ionicons name="thermometer-outline" size={20} color="#007AFF" />
            <Text style={styles.weatherText}>{weather}</Text>
          </View>
          {temperature && (
            <View style={styles.weatherItem}>
              <Ionicons name="thermometer" size={20} color="#007AFF" />
              <Text style={styles.weatherText}>{temperature}°C</Text>
            </View>
          )}
          {location && (
            <View style={styles.weatherItem}>
              <Ionicons name="location-outline" size={20} color="#007AFF" />
              <Text style={styles.weatherText}>{location}</Text>
            </View>
          )}
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Add a note (optional)"
        value={note}
        onChangeText={setNote}
        multiline
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.addButton, (!photoUri || isLoading) && styles.disabledButton]}
        onPress={handleAddEntry}
        disabled={!photoUri || isLoading}
      >
        <Text style={styles.addButtonText}>Add Entry</Text>
      </TouchableOpacity>
    </View>
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  previewContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  weatherInfo: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherText: {
    marginLeft: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddEntryScreen;
