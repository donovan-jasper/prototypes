import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useHistory } from 'react-router-dom';

const MyPlants = () => {
  const history = useHistory();
  const [plants, setPlants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock data for demonstration
    const mockPlants = [
      {
        id: '1',
        name: 'Monstera Deliciosa',
        scientificName: 'Monstera adansonii',
        image: 'https://example.com/monstera1.jpg',
        lastWatered: '2023-05-15',
        wateringFrequency: 'every 7-10 days',
        nextWatering: '2023-06-01',
        careReminders: 2
      },
      {
        id: '2',
        name: 'Snake Plant',
        scientificName: 'Sansevieria trifasciata',
        image: 'https://example.com/snakeplant.jpg',
        lastWatered: '2023-05-20',
        wateringFrequency: 'every 2-3 weeks',
        nextWatering: '2023-06-10',
        careReminders: 1
      },
      {
        id: '3',
        name: 'Pothos',
        scientificName: 'Epipremnum aureum',
        image: 'https://example.com/pothos.jpg',
        lastWatered: '2023-05-18',
        wateringFrequency: 'every 7 days',
        nextWatering: '2023-06-04',
        careReminders: 0
      }
    ];

    setPlants(mockPlants);
  }, []);

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.plantCard}
      onPress={() => history.push(`/plant/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.plantImage} />
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.scientificName}>{item.scientificName}</Text>
        <View style={styles.careSummary}>
          <Text style={styles.careText}>Last watered: {item.lastWatered}</Text>
          <Text style={styles.careText}>Water {item.wateringFrequency}</Text>
          <Text style={styles.careText}>Next watering: {item.nextWatering}</Text>
        </View>
        {item.careReminders > 0 && (
          <View style={styles.reminderBadge}>
            <Text style={styles.reminderText}>{item.careReminders} reminders</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Plants</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search plants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredPlants}
        keyExtractor={(item) => item.id}
        renderItem={renderPlantItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No plants found. Add your first plant!</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => history.push('/add-plant')}
            >
              <Text style={styles.addButtonText}>Add Plant</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => history.push('/add-plant')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  plantCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  plantImage: {
    width: 120,
    height: 120,
  },
  plantInfo: {
    flex: 1,
    padding: 12,
    position: 'relative',
  },
  plantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  careSummary: {
    marginBottom: 8,
  },
  careText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  reminderBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reminderText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2ecc71',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default MyPlants;
