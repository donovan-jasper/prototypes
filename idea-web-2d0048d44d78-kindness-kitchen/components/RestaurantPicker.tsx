import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getRestaurants } from '../services/api';

const RestaurantPicker = ({ onSelectRestaurant }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getRestaurants();
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let results = [...restaurants];

    if (searchQuery) {
      results = results.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCuisine) {
      results = results.filter(restaurant =>
        restaurant.cuisine.toLowerCase() === selectedCuisine.toLowerCase()
      );
    }

    setFilteredRestaurants(results);
  }, [searchQuery, selectedCuisine, restaurants]);

  const cuisines = [...new Set(restaurants.map(r => r.cuisine))];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search restaurants or cuisines..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.cuisineFilterContainer}>
        <Text style={styles.filterTitle}>Filter by cuisine:</Text>
        <View style={styles.cuisineButtons}>
          {cuisines.map(cuisine => (
            <TouchableOpacity
              key={cuisine}
              style={[
                styles.cuisineButton,
                selectedCuisine === cuisine && styles.selectedCuisineButton
              ]}
              onPress={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
            >
              <Text style={[
                styles.cuisineButtonText,
                selectedCuisine === cuisine && styles.selectedCuisineButtonText
              ]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      ) : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.restaurantItem}
              onPress={() => onSelectRestaurant(item)}
            >
              <Image source={{ uri: item.image }} style={styles.restaurantImage} />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.restaurantDetails}>
                  {item.cuisine} • {item.rating} ★ • {item.deliveryTime} min
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  cuisineFilterContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cuisineButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cuisineButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCuisineButton: {
    backgroundColor: '#FF6B6B',
  },
  cuisineButtonText: {
    color: '#333',
  },
  selectedCuisineButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  restaurantItem: {
    flexDirection: 'row',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantDetails: {
    color: '#666',
    fontSize: 14,
  },
});

export default RestaurantPicker;
