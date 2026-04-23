import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Restaurant, Inspection } from '@/types';
import SafetyScoreBadge from '@/components/SafetyScoreBadge';
import InspectionTimeline from '@/components/InspectionTimeline';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';

const RestaurantDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { isLoading, error } = useRestaurants();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setIsLoadingDetails(true);

        // Fetch restaurant details
        const restaurantData = await api.getRestaurantDetails(id as string);
        setRestaurant(restaurantData);

        // Fetch inspection history
        const inspectionData = await api.getInspectionsForRestaurant(id as string);
        setInspections(inspectionData);
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  if (isLoadingDetails) {
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
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
        <Text style={styles.address}>{restaurant.address}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <SafetyScoreBadge
          score={restaurant.safetyScore}
          lastInspectionDate={restaurant.lastInspectionDate}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inspection History</Text>
        <InspectionTimeline inspections={inspections} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Restaurant</Text>
        <Text style={styles.description}>
          {restaurant.name} is a {restaurant.cuisine} restaurant located at {restaurant.address}.
          This establishment has a safety score of {restaurant.safetyScore} based on the most recent inspection.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addToListButton}
        onPress={() => {
          // In a real app, this would add the restaurant to a user's list
          alert('This would add the restaurant to your list in a full implementation');
        }}
      >
        <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
        <Text style={styles.addToListText}>Add to List</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  backButtonText: {
    marginLeft: 5,
    color: '#4CAF50',
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#888',
  },
  scoreContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  addToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#e8f5e9',
    margin: 20,
    borderRadius: 8,
  },
  addToListText: {
    marginLeft: 10,
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RestaurantDetailScreen;
