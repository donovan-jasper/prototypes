import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MyPlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        // Simulate API call with more realistic data
        const mockData = [
          {
            id: '1',
            name: 'Monstera Deliciosa',
            scientificName: 'Monstera deliciosa',
            lastPhoto: 'https://images.unsplash.com/photo-1588746853740-ffbdb7fc3d18?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            nextCare: 'Water - 2023-05-22',
            careStatus: 'due',
            lastWatered: '2023-05-15'
          },
          {
            id: '2',
            name: 'Snake Plant',
            scientificName: 'Sansevieria trifasciata',
            lastPhoto: 'https://images.unsplash.com/photo-1588746853740-ffbdb7fc3d18?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            nextCare: 'Fertilize - 2023-05-25',
            careStatus: 'upcoming',
            lastWatered: '2023-05-18'
          },
          {
            id: '3',
            name: 'Pothos',
            scientificName: 'Epipremnum aureum',
            lastPhoto: 'https://images.unsplash.com/photo-1588746853740-ffbdb7fc3d18?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            nextCare: 'Prune - 2023-05-20',
            careStatus: 'overdue',
            lastWatered: '2023-05-10'
          }
        ];
        setPlants(mockData);
      } catch (error) {
        console.error('Error fetching plants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const getCareStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return '#FF5252';
      case 'due':
        return '#FFC107';
      case 'upcoming':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.plantCard}
            onPress={() => navigation.navigate('PlantDetail', { plant: item })}
          >
            <Image
              source={{ uri: item.lastPhoto }}
              style={styles.plantImage}
            />
            <View style={styles.plantInfo}>
              <Text style={styles.plantName}>{item.name}</Text>
              <Text style={styles.scientificName}>{item.scientificName}</Text>
              <View style={styles.careInfo}>
                <Text style={[
                  styles.careStatus,
                  { color: getCareStatusColor(item.careStatus) }
                ]}>
                  {item.nextCare}
                </Text>
                <Text style={styles.lastWatered}>Last watered: {item.lastWatered}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No plants yet. Add your first plant!</Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => navigation.navigate('AddPlant')}
            >
              <Text style={styles.emptyAddButtonText}>+ Add Plant</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPlant')}
      >
        <Text style={styles.addButtonText}>+ Add Plant</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  plantImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  plantInfo: {
    padding: 16,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  careInfo: {
    marginTop: 8,
  },
  careStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  lastWatered: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAddButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  emptyAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyPlants;
