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
          <Text style={styles.buttonText}>Select Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkipPhoto}>
          <Text style={styles.skipText}>Skip Photo</Text>
        </TouchableOpacity>
      </View>

      {photoUri && !skipPhoto && (
        <Image source={{ uri: photoUri }} style={styles.previewImage} />
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Fetching location and weather data...</Text>
        </View>
      )}

      <View style={styles.noteContainer}>
        <TextInput
          style={styles.noteInput}
          placeholder="Add a note..."
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
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
          <Ionicons name="location" size={20} color="#FF3B30" />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.disabledButton]}
        onPress={handleAddEntry}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Entry</Text>
        )}
      </TouchableOpacity>

      {error && (
        <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
          <Text style={styles.retryText}>Retry Fetching Data</Text>
        </TouchableOpacity>
      )}

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
    marginRight: 10,
  },
  skipButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
  },
  skipText: {
    color: '#007AFF',
    fontSize: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  noteContainer: {
    marginBottom: 20,
  },
  noteInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
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
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginBottom: 20,
  },
  retryText: {
    color: '#FF3B30',
    fontSize: 16,
  },
});

export default AddEntryScreen;
