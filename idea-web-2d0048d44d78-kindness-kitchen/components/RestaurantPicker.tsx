import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getRestaurants } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const RestaurantPicker = ({ onSelectRestaurant }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    onSelectRestaurant(restaurant);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or cuisines..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.restaurantItem,
                selectedRestaurant?.id === item.id && styles.selectedRestaurant
              ]}
              onPress={() => handleSelectRestaurant(item)}
            >
              <Image source={{ uri: item.image }} style={styles.restaurantImage} />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.restaurantDetails}>
                  {item.cuisine} • {item.rating} ★ • {item.deliveryTime} min
                </Text>
                <Text style={styles.restaurantPrice}>${item.price.toFixed(2)}</Text>
              </View>
              {selectedRestaurant?.id === item.id && (
                <Ionicons name="checkmark-circle" size={24} color="#FF6B6B" style={styles.selectedIcon} />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No restaurants found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
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
    backgroundColor: '#fff',
  },
  selectedRestaurant: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
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
    marginBottom: 5,
  },
  restaurantPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default RestaurantPicker;
