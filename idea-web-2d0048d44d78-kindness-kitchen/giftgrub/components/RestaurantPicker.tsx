import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useApi } from '../services/api';

const RestaurantPicker = ({ onSelect }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async () => {
    setLoading(true);
    const data = await useApi.getRestaurants();
    setRestaurants(data);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading restaurants...</Text>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.restaurant} onPress={() => onSelect(item)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.cuisine}>{item.cuisine}</Text>
              <Text style={styles.rating}>Rating: {item.rating}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  restaurant: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cuisine: {
    fontSize: 16,
    color: '#666',
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
});

export default RestaurantPicker;
