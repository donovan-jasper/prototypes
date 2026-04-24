import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchPlants, fetchCareReminders } from '../api';

const PlantDetail = () => {
  const [plant, setPlant] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { plantId } = route.params;

  useEffect(() => {
    const loadPlantData = async () => {
      try {
        const plantsData = await fetchPlants();
        const remindersData = await fetchCareReminders();

        const selectedPlant = plantsData.find(p => p.id === plantId);
        const plantReminders = remindersData
          .filter(r => r.plantId === plantId)
          .map(r => ({
            ...r,
            daysUntil: Math.ceil((new Date(r.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
          }))
          .sort((a, b) => a.daysUntil - b.daysUntil);

        setPlant(selectedPlant);
        setReminders(plantReminders);
      } catch (error) {
        console.error('Error loading plant details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlantData();
  }, [plantId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Plant not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: plant.latestPhoto || 'https://via.placeholder.com/300' }}
        style={styles.plantImage}
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <Text style={styles.plantSpecies}>{plant.species}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Reminders</Text>
          {reminders.length > 0 ? (
            reminders.map(reminder => (
              <View key={reminder.id} style={styles.reminderItem}>
                <Text style={styles.reminderType}>{reminder.type}</Text>
                <Text style={styles.reminderDate}>
                  Due in {reminder.daysUntil} days ({new Date(reminder.dueDate).toLocaleDateString()})
                </Text>
                <Text style={styles.reminderNotes}>{reminder.notes}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReminders}>No upcoming care reminders</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Notes</Text>
          <Text style={styles.careNotes}>{plant.careNotes}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#E64A19',
  },
  plantImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2E7D32',
  },
  plantSpecies: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2E7D32',
  },
  reminderItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reminderType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  reminderDate: {
    fontSize: 14,
    color: '#E64A19',
    marginBottom: 5,
  },
  reminderNotes: {
    fontSize: 14,
    color: '#555',
  },
  noReminders: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  careNotes: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});

export default PlantDetail;
