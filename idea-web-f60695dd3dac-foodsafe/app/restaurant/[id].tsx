import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useSubscription } from '@/hooks/useSubscription';
import { Restaurant, Inspection } from '@/types';
import { SafetyScoreBadge } from '@/components/SafetyScoreBadge';
import { InspectionTimeline } from '@/components/InspectionTimeline';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useLists } from '@/hooks/useLists';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { getRestaurantDetails, getInspectionHistory } = useRestaurants();
  const { lists, addRestaurantToList, createList } = useLists();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const restaurantData = await getRestaurantDetails(id as string);
        setRestaurant(restaurantData);

        if (restaurantData) {
          const inspectionData = await getInspectionHistory(restaurantData.id);
          setInspections(inspectionData);
        }
      } catch (err) {
        console.error('Error loading restaurant details:', err);
        setError('Failed to load restaurant details');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, getRestaurantDetails, getInspectionHistory]);

  const handleAddToList = useCallback(async () => {
    if (!restaurant) return;

    // Check if user has lists
    if (lists.length === 0) {
      // Create a default list if none exist
      try {
        const newList = await createList('My Favorites');
        await addRestaurantToList(newList.id, restaurant.id);
        Alert.alert('Added to List', `${restaurant.name} was added to your new favorites list.`);
      } catch (err) {
        Alert.alert('Error', 'Failed to create list. Please try again.');
      }
      return;
    }

    // For simplicity, just add to the first list
    try {
      await addRestaurantToList(lists[0].id, restaurant.id);
      Alert.alert('Added to List', `${restaurant.name} was added to your favorites list.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to add to list. Please try again.');
    }
  }, [restaurant, lists, createList, addRestaurantToList]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading restaurant details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Restaurant not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
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
          violationCount={restaurant.violationCount}
        />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAddToList}
        >
          <Ionicons name="bookmark-outline" size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Share', 'Sharing functionality coming soon!')}
        >
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inspection History</Text>
        {isPremium ? (
          <InspectionTimeline inspections={inspections} />
        ) : (
          <View style={styles.premiumPrompt}>
            <Text style={styles.premiumText}>
              View full inspection history with SafeBite Pro
            </Text>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.premiumButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Map will be displayed here</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scoreContainer: {
    padding: 20,
    backgroundColor: Colors.white,
    marginTop: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: Colors.white,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 20,
  },
  actionButtonText: {
    marginLeft: 8,
    color: Colors.primary,
    fontSize: 14,
  },
  section: {
    marginTop: 1,
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  premiumPrompt: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  premiumButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  premiumButtonText: {
    color: Colors.white,
    fontSize: 14,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: Colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: Colors.textSecondary,
  },
});
