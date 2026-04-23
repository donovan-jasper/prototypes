import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Restaurant } from '@/types';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';
import { RestaurantCard } from '@/components/RestaurantCard';
import { MapMarker } from '@/components/MapMarker';
import { useLocation } from '@/hooks/useLocation';
import { Colors } from '@/constants/Colors';

export default function MapScreen() {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { location, isLoading: isLocationLoading, error: locationError } = useLocation();
  const { restaurants, isLoading, error, refresh } = useRestaurants();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: location?.coords.latitude || 37.7749,
    longitude: location?.coords.longitude || -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Update map region when location changes
  useEffect(() => {
    if (location) {
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [location]);

  const handleMarkerPress = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  }, []);

  const handleCardPress = useCallback(() => {
    if (selectedRestaurant) {
      router.push(`/restaurant/${selectedRestaurant.id}`);
    }
  }, [selectedRestaurant, router]);

  const handleMapPress = useCallback(() => {
    setSelectedRestaurant(null);
  }, []);

  if (isLocationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{locationError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        onPress={handleMapPress}
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
            onPress={() => handleMarkerPress(restaurant)}
          >
            <MapMarker
              score={restaurant.safetyScore}
              isSelected={selectedRestaurant?.id === restaurant.id}
            />
          </Marker>
        ))}
      </MapView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedRestaurant && (
        <View style={styles.cardContainer}>
          <RestaurantCard
            restaurant={selectedRestaurant}
            onPress={handleCardPress}
            isPremium={isPremium}
          />
        </View>
      )}
    </View>
  );
}

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
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
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
  errorBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.errorBackground,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});
