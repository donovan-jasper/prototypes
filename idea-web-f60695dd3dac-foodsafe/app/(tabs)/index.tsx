import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useRestaurants } from '@/hooks/useRestaurants';
import MapMarker from '@/components/MapMarker';
import RestaurantCard from '@/components/RestaurantCard';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';
import { Restaurant } from '@/types';

const MapScreen = () => {
  const router = useRouter();
  const {
    restaurants,
    isLoading,
    error,
    location,
    isOffline,
    currentCity,
    fetchRestaurantsByLocation,
    refreshData,
  } = useRestaurants();
  const { isPremium } = useSubscription();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    fetchRestaurantsByLocation();
  }, [fetchRestaurantsByLocation]);

  const handleMarkerPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleCardPress = () => {
    if (selectedRestaurant) {
      router.push(`/restaurant/${selectedRestaurant.id}`);
    }
  };

  const handleRefresh = async () => {
    await refreshData();
    setSelectedRestaurant(null);
  };

  if (isLoading && restaurants.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading nearby restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {restaurants.map((restaurant) => (
            <MapMarker
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => handleMarkerPress(restaurant)}
            />
          ))}
        </MapView>
      )}

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode - Showing cached data</Text>
        </View>
      )}

      {selectedRestaurant && (
        <View style={styles.cardContainer}>
          <RestaurantCard
            restaurant={selectedRestaurant}
            onPress={handleCardPress}
            showDistance={true}
            userLocation={location?.coords}
          />
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}

      <View style={styles.cityInfo}>
        <Text style={styles.cityText}>
          {currentCity === 'nyc' ? 'New York City' :
           currentCity === 'chicago' ? 'Chicago' :
           'San Francisco'}
        </Text>
        {!isPremium && (
          <Text style={styles.premiumText}>Premium features available</Text>
        )}
      </View>
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
    marginTop: 16,
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
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFC107',
    padding: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  offlineText: {
    color: '#333',
    fontWeight: 'bold',
  },
  cityInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  cityText: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  premiumText: {
    color: '#4CAF50',
    fontSize: 12,
  },
});

export default MapScreen;
