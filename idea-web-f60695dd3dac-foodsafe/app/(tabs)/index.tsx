import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Restaurant } from '@/types';
import { Colors } from '@/constants/Colors';
import MapMarker from '@/components/MapMarker';
import RestaurantCard from '@/components/RestaurantCard';
import { useRouter } from 'expo-router';

const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'The Green Leaf Bistro',
    address: '123 Main St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    safetyScore: 95,
    lastInspectionDate: '2024-02-15',
    violationCount: 1,
    cuisine: 'American',
  },
  {
    id: '2',
    name: 'Sushi Paradise',
    address: '456 Market St, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    safetyScore: 88,
    lastInspectionDate: '2024-01-20',
    violationCount: 3,
    cuisine: 'Japanese',
  },
  {
    id: '3',
    name: 'Pizza Heaven',
    address: '789 Valencia St, San Francisco, CA',
    latitude: 37.7649,
    longitude: -122.4294,
    safetyScore: 72,
    lastInspectionDate: '2024-02-01',
    violationCount: 5,
    cuisine: 'Italian',
  },
  {
    id: '4',
    name: 'Taco Fiesta',
    address: '321 Mission St, San Francisco, CA',
    latitude: 37.7949,
    longitude: -122.3994,
    safetyScore: 91,
    lastInspectionDate: '2024-02-10',
    violationCount: 2,
    cuisine: 'Mexican',
  },
  {
    id: '5',
    name: 'Burger Palace',
    address: '654 Castro St, San Francisco, CA',
    latitude: 37.7549,
    longitude: -122.4394,
    safetyScore: 85,
    lastInspectionDate: '2024-01-25',
    violationCount: 4,
    cuisine: 'American',
  },
];

export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby restaurants.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      await fetchNearbyRestaurants(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Using default location.');
      await fetchNearbyRestaurants(37.7749, -122.4194);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyRestaurants = async (latitude: number, longitude: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setRestaurants(MOCK_RESTAURANTS);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      Alert.alert('Error', 'Failed to load nearby restaurants.');
    }
  };

  const getMarkerColor = (score: number): string => {
    if (score >= 90) return Colors.score.high;
    if (score >= 70) return Colors.score.medium;
    return Colors.score.low;
  };

  const handleMarkerPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleCardPress = () => {
    if (selectedRestaurant) {
      router.push(`/restaurant/${selectedRestaurant.id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Finding nearby restaurants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton
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
              color={getMarkerColor(restaurant.safetyScore)}
            />
          </Marker>
        ))}
      </MapView>

      {selectedRestaurant && (
        <View style={styles.cardContainer}>
          <RestaurantCard
            restaurant={selectedRestaurant}
            onPress={handleCardPress}
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
    color: Colors.textSecondary,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
});
