import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useHistory } from 'react-router-dom';
import * as ImagePicker from 'expo-image-picker';

const AddPlant = () => {
  const history = useHistory();
  const [plantData, setPlantData] = useState({
    name: '',
    scientificName: '',
    description: '',
    wateringFrequency: '',
    lightRequirements: '',
    careInstructions: '',
    image: null
  });

  const handleInputChange = (name, value) => {
    setPlantData(prev => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleInputChange('image', result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    // In a real app, you would save the plant data to your backend here
    console.log('Plant data to be saved:', plantData);
    alert('Plant added successfully!');
    history.push('/my-plants');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Plant</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Plant Name</Text>
        <TextInput
          style={styles.input}
          value={plantData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholder="e.g. Monstera Deliciosa"
        />

        <Text style={styles.label}>Scientific Name</Text>
        <TextInput
          style={styles.input}
          value={plantData.scientificName}
          onChangeText={(text) => handleInputChange('scientificName', text)}
          placeholder="e.g. Monstera adansonii"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={plantData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="Describe your plant..."
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Watering Frequency</Text>
        <TextInput
          style={styles.input}
          value={plantData.wateringFrequency}
          onChangeText={(text) => handleInputChange('wateringFrequency', text)}
          placeholder="e.g. every 7-10 days"
        />

        <Text style={styles.label}>Light Requirements</Text>
        <TextInput
          style={styles.input}
          value={plantData.lightRequirements}
          onChangeText={(text) => handleInputChange('lightRequirements', text)}
          placeholder="e.g. Bright, indirect light"
        />

        <Text style={styles.label}>Care Instructions</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={plantData.careInstructions}
          onChangeText={(text) => handleInputChange('careInstructions', text)}
          placeholder="Add specific care instructions..."
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Plant Photo</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {plantData.image ? (
            <Image source={{ uri: plantData.image }} style={styles.previewImage} />
          ) : (
            <Text style={styles.imagePickerText}>Tap to select an image</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Plant</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#2ecc71',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  imagePickerText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddPlant;
