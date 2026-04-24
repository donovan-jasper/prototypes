import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useParams } from 'react-router-dom';

const PlantTimeline = () => {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [newCaption, setNewCaption] = useState('');
  const [newImage, setNewImage] = useState(null);

  // Mock data - in a real app this would come from an API
  useEffect(() => {
    const mockPlants = {
      '1': {
        id: '1',
        name: 'Monstera Deliciosa',
        photos: [
          { id: '1', uri: 'https://images.unsplash.com/photo-1588124500190-1f23ce6144f2', date: '2023-01-15', caption: 'Just planted!' },
          { id: '2', uri: 'https://images.unsplash.com/photo-1588124500190-1f23ce6144f2', date: '2023-02-20', caption: 'First leaves emerging' },
        ],
        reminders: [
          { id: '1', task: 'Water', dueDate: '2023-06-15', completed: false },
          { id: '2', task: 'Fertilize', dueDate: '2023-06-20', completed: false },
          { id: '3', task: 'Rotate', dueDate: '2023-06-25', completed: false },
        ]
      }
    };

    setPlant(mockPlants[id]);
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const addPhoto = () => {
    if (!newImage || !newCaption) {
      Alert.alert('Error', 'Please select an image and add a caption');
      return;
    }

    const newPhoto = {
      id: Date.now().toString(),
      uri: newImage,
      date: new Date().toISOString().split('T')[0],
      caption: newCaption
    };

    setPlant(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));

    setNewImage(null);
    setNewCaption('');
    Alert.alert('Success', 'Photo added to timeline!');
  };

  const toggleReminder = (reminderId) => {
    setPlant(prev => ({
      ...prev,
      reminders: prev.reminders.map(reminder =>
        reminder.id === reminderId ? { ...reminder, completed: !reminder.completed } : reminder
      )
    }));
  };

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{plant.name}</Text>

      {/* Photo Timeline */}
      <Text style={styles.sectionTitle}>Photo Timeline</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoTimeline}>
        {plant.photos.map(photo => (
          <View key={photo.id} style={styles.photoCard}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <Text style={styles.photoDate}>{photo.date}</Text>
            <Text style={styles.photoCaption}>{photo.caption}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Care Reminders */}
      <Text style={styles.sectionTitle}>Care Reminders</Text>
      <FlatList
        data={plant.reminders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.reminderItem}
            onPress={() => toggleReminder(item.id)}
          >
            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.reminderText}>
              <Text style={styles.reminderTask}>{item.task}</Text>
              <Text style={styles.reminderDate}>Due: {item.dueDate}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add New Photo Form */}
      <Text style={styles.sectionTitle}>Add New Photo</Text>
      <View style={styles.addPhotoForm}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {newImage ? (
            <Image source={{ uri: newImage }} style={styles.previewImage} />
          ) : (
            <Text style={styles.pickerText}>Select Image</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption..."
          value={newCaption}
          onChangeText={setNewCaption}
          multiline
        />

        <TouchableOpacity style={styles.addButton} onPress={addPhoto}>
          <Text style={styles.addButtonText}>Add to Timeline</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2e7d32',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#388e3c',
  },
  photoTimeline: {
    marginBottom: 20,
  },
  photoCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photo: {
    width: '100%',
    height: 150,
    borderRadius: 6,
    marginBottom: 8,
  },
  photoDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  photoCaption: {
    fontSize: 14,
    color: '#333',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#388e3c',
    borderRadius: 4,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#388e3c',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  reminderText: {
    flex: 1,
  },
  reminderTask: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  reminderDate: {
    fontSize: 14,
    color: '#666',
  },
  addPhotoForm: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePicker: {
    width: '100%',
    height: 150,
    backgroundColor: '#e8f5e9',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  pickerText: {
    color: '#388e3c',
    fontSize: 16,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#388e3c',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlantTimeline;
