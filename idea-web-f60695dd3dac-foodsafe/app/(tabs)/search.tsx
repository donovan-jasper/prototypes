import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Restaurant } from '@/types';
import { Colors } from '@/constants/Colors';
import RestaurantCard from '@/components/RestaurantCard';
import FilterSheet from '@/components/FilterSheet';
import { searchRestaurants } from '@/services/api';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [filters, setFilters] = useState({
    minScore: 0,
    maxScore: 100,
    allergyFriendly: false,
    recentInspections: false,
    zeroCriticalViolations: false,
  });

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch();
    } else {
      setRestaurants([]);
      setFilteredRestaurants([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [restaurants, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const results = await searchRestaurants(searchQuery);
      setRestaurants(results);
    } catch (error) {
      console.error('Search error:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = restaurants.filter(
      (r) => r.safetyScore >= filters.minScore && r.safetyScore <= filters.maxScore
    );
    setFilteredRestaurants(filtered);
  };

  const handleFilterApply = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setFilterSheetVisible(false);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View style={styles.cardWrapper}>
      <RestaurantCard restaurant={item} onPress={() => handleRestaurantPress(item)} />
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;
    
    if (searchQuery.trim().length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Search for restaurants</Text>
          <Text style={styles.emptyText}>
            Enter a restaurant name or cuisine type to get started
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>😕</Text>
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptyText}>
          Try adjusting your search or filters
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or cuisine..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterSheetVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterSheet
        visible={filterSheetVisible}
        filters={filters}
        onApply={handleFilterApply}
        onClose={() => setFilterSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    marginRight: 12,
  },
  filterButton: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: 16,
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
