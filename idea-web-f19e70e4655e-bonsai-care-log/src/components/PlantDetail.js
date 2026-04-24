import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useParams } from 'react-router-dom';

const PlantDetail = () => {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    // Mock data for demonstration
    const mockPlant = {
      id: '1',
      name: 'Monstera Deliciosa',
      scientificName: 'Monstera adansonii',
      description: 'A popular tropical plant with large, split leaves. Thrives in bright, indirect light and prefers well-draining soil.',
      lastWatered: '2023-05-15',
      wateringFrequency: 'every 7-10 days',
      lightRequirements: 'Bright, indirect light',
      careInstructions: 'Water when the top inch of soil is dry. Avoid direct sunlight which can scorch the leaves.'
    };

    const mockPhotos = [
      { id: '1', uri: 'https://example.com/monstera1.jpg', date: '2023-01-10' },
      { id: '2', uri: 'https://example.com/monstera2.jpg', date: '2023-03-15' },
      { id: '3', uri: 'https://example.com/monstera3.jpg', date: '2023-05-20' }
    ];

    const mockReminders = [
      { id: '1', message: 'Water your Monstera', dueDate: '2023-06-01' },
      { id: '2', message: 'Check for pests', dueDate: '2023-06-15' }
    ];

    setPlant(mockPlant);
    setPhotos(mockPhotos);
    setReminders(mockReminders);
  }, [id]);

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{plant.name}</Text>
        <Text style={styles.scientificName}>{plant.scientificName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plant Photos</Text>
        <FlatList
          horizontal
          data={photos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.photoContainer}>
              <Image source={{ uri: item.uri }} style={styles.photo} />
              <Text style={styles.photoDate}>{item.date}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Care Information</Text>
        <View style={styles.careInfo}>
          <Text style={styles.careText}>Last Watered: {plant.lastWatered}</Text>
          <Text style={styles.careText}>Watering Frequency: {plant.wateringFrequency}</Text>
          <Text style={styles.careText}>Light Requirements: {plant.lightRequirements}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Care Reminders</Text>
        {reminders.map(reminder => (
          <View key={reminder.id} style={styles.reminderItem}>
            <Text style={styles.reminderText}>{reminder.message}</Text>
            <Text style={styles.reminderDate}>Due: {new Date(reminder.dueDate).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Care Instructions</Text>
        <Text style={styles.instructions}>{plant.careInstructions}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  photoContainer: {
    marginRight: 12,
    width: 120,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 4,
  },
  photoDate: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  careInfo: {
    marginBottom: 12,
  },
  careText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
  },
  reminderItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#e8f4f8',
    borderRadius: 4,
  },
  reminderText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
  },
  reminderDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  instructions: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
});

export default PlantDetail;
