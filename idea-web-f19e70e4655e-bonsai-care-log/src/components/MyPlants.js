import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchPlants, fetchCareReminders } from '../api';

const MyPlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const plantsData = await fetchPlants();
        const remindersData = await fetchCareReminders();

        // Combine plant data with their next care reminder
        const plantsWithReminders = plantsData.map(plant => {
          const plantReminders = remindersData.filter(reminder => reminder.plantId === plant.id);
          const nextReminder = plantReminders.length > 0
            ? plantReminders.reduce((prev, current) =>
                (new Date(prev.dueDate) < new Date(current.dueDate)) ? prev : current)
            : null;

          return {
            ...plant,
            nextReminder: nextReminder ? {
              type: nextReminder.type,
              dueDate: nextReminder.dueDate,
              daysUntil: Math.ceil((new Date(nextReminder.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
            } : null
          };
        });

        setPlants(plantsWithReminders);
      } catch (error) {
        console.error('Error loading plant data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderPlantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.plantCard}
      onPress={() => navigation.navigate('PlantDetail', { plantId: item.id })}
    >
      <Image
        source={{ uri: item.latestPhoto || 'https://via.placeholder.com/100' }}
        style={styles.plantImage}
      />
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.name}</Text>
        {item.nextReminder ? (
          <Text style={styles.reminderText}>
            {item.nextReminder.type} in {item.nextReminder.daysUntil} days
          </Text>
        ) : (
          <Text style={styles.noReminderText}>No upcoming care</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Plants</Text>
      <FlatList
        data={plants}
        renderItem={renderPlantItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPlant')}
      >
        <Text style={styles.addButtonText}>Add New Plant</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  plantCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  reminderText: {
    fontSize: 14,
    color: '#E64A19',
  },
  noReminderText: {
    fontSize: 14,
    color: '#757575',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyPlants;
