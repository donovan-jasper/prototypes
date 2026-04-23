import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Restaurant } from '@/types';
import RestaurantCard from '@/components/RestaurantCard';
import { useRouter } from 'expo-router';

const MapScreen = () => {
  const { restaurants, isLoading, error, location, fetchRestaurantsByLocation } = useRestaurants();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRestaurantsByLocation();
  }, [fetchRestaurantsByLocation]);

  const getMarkerColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  const handleMarkerPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleCardPress = (restaurantId: string) => {
    router.push(`/restaurant/${restaurantId}`);
  };

  if (isLoading && !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.coords.latitude || 37.7749,
          longitude: location?.coords.longitude || -122.4194,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }}
            pinColor={getMarkerColor(restaurant.safetyScore)}
            onPress={() => handleMarkerPress(restaurant)}
          />
        ))}
      </MapView>

      {selectedRestaurant && (
        <View style={styles.cardContainer}>
          <RestaurantCard
            restaurant={selectedRestaurant}
            onPress={() => handleCardPress(selectedRestaurant.id)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1,
  },
});

export default MapScreen;
