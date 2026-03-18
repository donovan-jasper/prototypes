import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Text, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { addEntry } from '../services/database';
import { fetchWeather } from '../services/weather';
import { useCategories } from '../hooks/useCategories';

const AddEntryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { selectedCategoryId } = useCategories();
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

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
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required to select photos');
      return;
    }

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
  };

  const fetchLocationAndWeather = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to fetch weather data');
        setIsLoading(false);
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
      Alert.alert('Error', 'Failed to fetch location and weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!photoUri) {
      Alert.alert('Photo required', 'Please capture or select a photo first');
      return;
    }

    setIsLoading(true);
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
      Alert.alert('Error', 'Failed to add entry');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Button title="Take Photo" onPress={pickImageFromCamera} />
        <Button title="Choose from Gallery" onPress={pickImageFromGallery} />
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

      {weather && (
        <View style={styles.weatherInfo}>
          <Text style={styles.weatherText}>Weather: {weather}</Text>
          {temperature && <Text style={styles.weatherText}>Temperature: {temperature}°C</Text>}
          {location && <Text style={styles.weatherText}>Location: {location}</Text>}
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Add a note (optional)"
        value={note}
        onChangeText={setNote}
        multiline
      />

      <Button 
        title="Add Entry" 
        onPress={handleAddEntry} 
        disabled={isLoading || !photoUri}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  previewContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  weatherInfo: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  weatherText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
});

export default AddEntryScreen;
