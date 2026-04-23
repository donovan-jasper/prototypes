import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useSubscription } from '@/hooks/useSubscription';
import SafetyScoreBadge from '@/components/SafetyScoreBadge';
import InspectionTimeline from '@/components/InspectionTimeline';
import { Restaurant, Inspection } from '@/types';

const RestaurantDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getRestaurantDetails, isLoading, error, isOffline } = useRestaurants();
  const { isPremium } = useSubscription();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isAddingToList, setIsAddingToList] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (typeof id === 'string') {
          const restaurantData = await getRestaurantDetails(id);
          setRestaurant(restaurantData);

          // In a real app, you would fetch inspections separately
          // For demo purposes, we'll simulate them
          const mockInspections: Inspection[] = [
            {
              id: '1',
              restaurantId: id,
              date: '2023-10-15',
              score: 95,
              violations: [],
            },
            {
              id: '2',
              restaurantId: id,
              date: '2023-07-20',
              score: 88,
              violations: [
                {
                  id: 'v1',
                  description: 'Improper food storage',
                  severity: 'medium',
                },
              ],
            },
            {
              id: '3',
              restaurantId: id,
              date: '2023-04-10',
              score: 92,
              violations: [],
            },
          ];
          setInspections(mockInspections);
        }
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
        Alert.alert('Error', 'Failed to load restaurant details. Please try again.');
      }
    };

    fetchData();
  }, [id, getRestaurantDetails]);

  const handleAddToList = () => {
    if (!restaurant) return;

    setIsAddingToList(true);
    // In a real app, you would navigate to a list selection screen
    // For demo purposes, we'll show an alert
    Alert.alert(
      'Add to List',
      `Would you like to add ${restaurant.name} to a list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => {
          // In a real app, you would add the restaurant to the selected list
          Alert.alert('Success', `${restaurant.name} added to your list!`);
          setIsAddingToList(false);
        }},
      ]
    );
  };

  if (isLoading && !restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading restaurant details...</Text>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Restaurant not found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode - Showing cached data</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
        <Text style={styles.address}>{restaurant.address}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <SafetyScoreBadge restaurant={restaurant} size="large" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inspection History</Text>
        <InspectionTimeline
          inspections={inspections}
          isPremium={isPremium}
        />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.addToListButton}
          onPress={handleAddToList}
          disabled={isAddingToList}
        >
          <Text style={styles.addToListButtonText}>
            {isAddingToList ? 'Adding...' : 'Add to List'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  offlineBanner: {
    backgroundColor: '#FFC107',
    padding: 10,
    alignItems: 'center',
  },
  offlineText: {
    color: '#333',
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  scoreContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionButtons: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addToListButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  addToListButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RestaurantDetailScreen;
