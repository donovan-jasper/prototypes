import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const AddPlant = () => {
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [acquiredDate, setAcquiredDate] = useState('');
  const [lightRequirements, setLightRequirements] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('');
  const [photo, setPhoto] = useState(null);
  const navigation = useNavigation();

  const pickImage = async () => {
    try {
      let result = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (result.granted === false) {
        Alert.alert('Permission required', 'Please grant camera roll permissions to select a photo');
        return;
      }

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a plant name');
      return;
    }

    // In a real app, this would save the plant to your database
    console.log('Plant added:', {
      name,
      scientificName,
      acquiredDate,
      lightRequirements,
      wateringFrequency,
      photo
    });

    // Navigate back to MyPlants after adding
    navigation.navigate('MyPlants');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Plant</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Common Name*</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Monstera Deliciosa"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Scientific Name</Text>
        <TextInput
          style={styles.input}
          value={scientificName}
          onChangeText={setScientificName}
          placeholder="e.g. Monstera deliciosa"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Acquired Date</Text>
        <TextInput
          style={styles.input}
          value={acquiredDate}
          onChangeText={setAcquiredDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Light Requirements</Text>
        <TextInput
          style={styles.input}
          value={lightRequirements}
          onChangeText={setLightRequirements}
          placeholder="e.g. Bright, indirect light"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Watering Frequency</Text>
        <TextInput
          style={styles.input}
          value={wateringFrequency}
          onChangeText={setWateringFrequency}
          placeholder="e.g. Every 7-10 days"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Photo</Text>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.previewImage} />
        ) : (
          <Text style={styles.photoPlaceholder}>No photo selected</Text>
        )}
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoButtonText}>Select Photo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Plant</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoPlaceholder: {
    color: '#666',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 8,
  },
  photoButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPlant;
