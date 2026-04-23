import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';
import { mockRestaurants } from '../../services/api';

const HomeScreen = () => {
  const router = useRouter();
  const { addGift } = useGiftStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const filteredRestaurants = mockRestaurants
    .filter(restaurant =>
      (selectedCuisine === 'All' || restaurant.cuisine === selectedCuisine) &&
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const cuisines = ['All', ...new Set(mockRestaurants.map(r => r.cuisine))];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Restaurant</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search restaurants..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.cuisineFilters}>
        {cuisines.map(cuisine => (
          <TouchableOpacity
            key={cuisine}
            style={[
              styles.cuisineButton,
              selectedCuisine === cuisine && styles.selectedCuisine
            ]}
            onPress={() => setSelectedCuisine(cuisine)}
          >
            <Text style={styles.cuisineText}>{cuisine}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => {
              addGift({
                restaurant: item,
                recipientName: '',
                message: '',
                amount: 0,
                status: 'pending',
                scheduledFor: new Date(),
              });
              router.push(`/gift/${item.id}`);
            }}
          >
            <Image source={{ uri: item.image }} style={styles.restaurantImage} />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{item.name}</Text>
              <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>{item.rating} ★</Text>
                <Text style={styles.deliveryTime}>{item.deliveryTime} min</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  cuisineFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  cuisineButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCuisine: {
    backgroundColor: '#FF6B6B',
  },
  cuisineText: {
    color: '#333',
  },
  restaurantCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginRight: 8,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
