import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PlantListScreen = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      // Replace with actual API endpoint
      const response = await fetch('https://api.example.com/plants');
      const data = await response.json();
      setPlants(data);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPlantItem = ({ item }) => (
    <View style={styles.plantCard}>
      <Image
        source={{ uri: item.latestPhoto || 'https://via.placeholder.com/150' }}
        style={styles.plantImage}
      />
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.plantSpecies}>{item.species}</Text>
        <Text style={styles.careReminder}>
          Next care: {item.nextCare || 'No upcoming care'}
        </Text>
        <TouchableOpacity
          style={styles.viewTimelineButton}
          onPress={() => navigation.navigate('PlantDetail', { plantId: item.id })}
        >
          <Text style={styles.buttonText}>View Timeline</Text>
        </TouchableOpacity>
      </View>
    </View>
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
      <FlatList
        data={plants}
        renderItem={renderPlantItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
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
  listContent: {
    padding: 16,
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
    height: 180,
    resizeMode: 'cover',
  },
  plantInfo: {
    padding: 16,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  plantSpecies: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  careReminder: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 12,
  },
  viewTimelineButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PlantListScreen;
