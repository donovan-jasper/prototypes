import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useActivities } from '../../hooks/useActivities';
import ActivityCard from '../../components/ActivityCard';
import CategoryFilter from '../../components/CategoryFilter';
import RadiusSlider from '../../components/RadiusSlider';
import * as Location from 'expo-location';

export default function FeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [radius, setRadius] = useState(1);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { activities, loading, error, refresh } = useActivities(location?.coords, radius, selectedCategory);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission denied. Using default location.');
          // Default to a central location if permission is denied
          setLocation({
            coords: {
              latitude: 37.7749, // San Francisco coordinates
              longitude: -122.4194,
              accuracy: 1000,
              altitude: 0,
              altitudeAccuracy: 0,
              heading: 0,
              speed: 0,
            },
            timestamp: Date.now(),
          });
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (err) {
        setLocationError('Error getting location. Using default location.');
        setLocation({
          coords: {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 1000,
            altitude: 0,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0,
          },
          timestamp: Date.now(),
        });
      }
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (!location && !locationError) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Getting your location...</Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading activities...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-lg text-red-600 text-center mb-4">{error}</Text>
        <Text className="text-sm text-gray-600 text-center">
          Pull down to try again
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        ListHeaderComponent={
          <View>
            <View className="bg-white px-4 pt-4 pb-2">
              <Text className="text-2xl font-bold mb-4 text-gray-900">
                Nearby Activities
              </Text>
              {locationError && (
                <Text className="text-sm text-yellow-600 mb-2">
                  {locationError}
                </Text>
              )}
              <RadiusSlider value={radius} onChange={setRadius} />
            </View>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center p-8">
            <Text className="text-lg text-gray-600 text-center mb-2">
              No activities nearby
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Be the first to post something!
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
