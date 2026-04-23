import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Restaurant } from '@/types';
import { useRouter } from 'expo-router';
import { SafetyScoreBadge } from '@/components/SafetyScoreBadge';
import { RestaurantCard } from '@/components/RestaurantCard';
import { MapMarker } from '@/components/MapMarker';

export default function MapScreen() {
  const router = useRouter();
  const { restaurants, isLoading, error, refresh } = useRestaurants();
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handleRegionChange = useCallback((newRegion) => {
    setRegion(newRegion);
  }, []);

  const handleMarkerPress = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  }, []);

  const handleCalloutPress = useCallback(() => {
    if (selectedRestaurant) {
      router.push(`/restaurant/${selectedRestaurant.id}`);
    }
  }, [selectedRestaurant, router]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission not granted');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (err) {
        console.error('Error getting location:', err);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading nearby restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load restaurants: {error.message}</Text>
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
        region={region}
        onRegionChangeComplete={handleRegionChange}
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
            <MapMarker score={restaurant.safetyScore} />
            <Callout onPress={handleCalloutPress}>
              <View style={styles.calloutContainer}>
                <RestaurantCard
                  restaurant={restaurant}
                  showDistance={false}
                  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {selectedRestaurant && (
        <View style={styles.selectedRestaurantContainer}>
          <RestaurantCard
            restaurant={selectedRestaurant}
            showDistance={true}
            onPress={() => router.push(`/restaurant/${selectedRestaurant.id}`)}
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
    padding: 20,
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
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  calloutContainer: {
    width: 250,
  },
  selectedRestaurantContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
