import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MyPlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    // Simulate API call to fetch plants
    const fetchPlants = async () => {
      try {
        // In a real app, this would be an actual API call
        const mockPlants = [
          {
            id: '1',
            name: 'Monstera Deliciosa',
            nickname: 'Big Monsta',
            image: 'https://images.unsplash.com/photo-1588082961428-9b7c5f4927d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            lastWatered: '2023-05-15',
            wateringFrequency: 7,
            nextWatering: '2023-05-22'
          },
          {
            id: '2',
            name: 'Snake Plant',
            nickname: 'Sly Snake',
            image: 'https://images.unsplash.com/photo-1588082961428-9b7c5f4927d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            lastWatered: '2023-05-10',
            wateringFrequency: 14,
            nextWatering: '2023-05-24'
          },
          {
            id: '3',
            name: 'Pothos',
            nickname: 'Golden Pothos',
            image: 'https://images.unsplash.com/photo-1588082961428-9b7c5f4927d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            lastWatered: '2023-05-01',
            wateringFrequency: 5,
            nextWatering: '2023-05-06'
          }
        ];
        setPlants(mockPlants);
      } catch (error) {
        console.error('Error fetching plants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const calculateDaysUntilWatering = (nextWateringDate) => {
    const today = new Date();
    const nextDate = new Date(nextWateringDate);
    const diffTime = nextDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderPlantItem = ({ item }) => {
    const daysUntilWatering = calculateDaysUntilWatering(item.nextWatering);

    return (
      <TouchableOpacity
        style={styles.plantCard}
        onPress={() => navigation.navigate('PlantDetail', { plantId: item.id })}
      >
        <Image source={{ uri: item.image }} style={styles.plantImage} />
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{item.nickname || item.name}</Text>
          <Text style={styles.plantSpecies}>{item.name}</Text>
          <View style={styles.reminderContainer}>
            <Text style={styles.reminderText}>
              Water in {daysUntilWatering} day{daysUntilWatering !== 1 ? 's' : ''}
            </Text>
            {daysUntilWatering <= 3 && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>URGENT</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading your plants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Plants</Text>
      {plants.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You don't have any plants yet!</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddPlant')}
          >
            <Text style={styles.addButtonText}>Add Your First Plant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plants}
          renderItem={renderPlantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  plantCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    flexDirection: 'row',
  },
  plantImage: {
    width: 120,
    height: 120,
  },
  plantInfo: {
    flex: 1,
    padding: 12,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  plantSpecies: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  reminderText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  urgentBadge: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  urgentText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MyPlants;
