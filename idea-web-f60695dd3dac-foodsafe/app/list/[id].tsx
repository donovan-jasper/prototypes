import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { UserList, Restaurant } from '@/types';
import { getUserLists, saveUserList, getCachedRestaurantById } from '@/services/database';
import RestaurantCard from '@/components/RestaurantCard';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [list, setList] = useState<UserList | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListDetails();
  }, [id]);

  const loadListDetails = async () => {
    try {
      const userLists = await getUserLists();
      const foundList = userLists.find((l) => l.id === id);
      
      if (!foundList) {
        Alert.alert('Error', 'List not found');
        router.back();
        return;
      }

      setList(foundList);

      const restaurantPromises = foundList.restaurantIds.map((restaurantId) =>
        getCachedRestaurantById(restaurantId)
      );
      const loadedRestaurants = await Promise.all(restaurantPromises);
      setRestaurants(loadedRestaurants.filter((r): r is Restaurant => r !== null));
    } catch (error) {
      console.error('Error loading list details:', error);
      Alert.alert('Error', 'Failed to load list details');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRestaurant = (restaurantId: string) => {
    if (!list) return;

    Alert.alert(
      'Remove Restaurant',
      'Are you sure you want to remove this restaurant from the list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedList: UserList = {
                ...list,
                restaurantIds: list.restaurantIds.filter((id) => id !== restaurantId),
              };
              await saveUserList(updatedList);
              setList(updatedList);
              setRestaurants(restaurants.filter((r) => r.id !== restaurantId));
            } catch (error) {
              console.error('Error removing restaurant:', error);
              Alert.alert('Error', 'Failed to remove restaurant');
            }
          },
        },
      ]
    );
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View style={styles.restaurantWrapper}>
      <RestaurantCard restaurant={item} onPress={() => handleRestaurantPress(item)} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveRestaurant(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.removeButtonText}>Remove from List</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🍽️</Text>
      <Text style={styles.emptyTitle}>No restaurants yet</Text>
      <Text style={styles.emptyText}>
        Add restaurants to this list from their detail pages
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!list) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.listName}>{list.name}</Text>
          <Text style={styles.restaurantCount}>
            {restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'}
          </Text>
        </View>
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          restaurants.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  header: {
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerInfo: {
    marginBottom: 4,
  },
  listName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  restaurantCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  restaurantWrapper: {
    marginBottom: 16,
  },
  removeButton: {
    backgroundColor: Colors.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
