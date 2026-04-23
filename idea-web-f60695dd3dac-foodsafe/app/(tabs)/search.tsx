import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TextInput, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Restaurant } from '@/types';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';
import { RestaurantCard } from '@/components/RestaurantCard';
import { FilterSheet } from '@/components/FilterSheet';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { restaurants, isLoading, error, searchRestaurants, refresh } = useRestaurants();
  const [query, setQuery] = useState('');
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const [filters, setFilters] = useState({
    minScore: 0,
    maxScore: 100,
    recentInspection: false,
    noViolations: false,
    allergyFriendly: false,
  });

  const handleSearch = useCallback(async () => {
    if (query.trim()) {
      await searchRestaurants(query);
    }
  }, [query, searchRestaurants]);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setIsFilterSheetVisible(false);
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (filters.minScore > 0 && restaurant.safetyScore < filters.minScore) return false;
    if (filters.maxScore < 100 && restaurant.safetyScore > filters.maxScore) return false;
    if (filters.recentInspection) {
      const inspectionDate = new Date(restaurant.lastInspectionDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (inspectionDate < thirtyDaysAgo) return false;
    }
    if (filters.noViolations && restaurant.violationCount > 0) return false;
    // Note: allergyFriendly filter would require additional data from API
    return true;
  });

  const renderItem = useCallback(({ item }: { item: Restaurant }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => router.push(`/restaurant/${item.id}`)}
      isPremium={isPremium}
    />
  ), [router, isPremium]);

  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>Searching for restaurants...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (query.trim() && restaurants.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No restaurants found for "{query}". Try a different search.</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Search for restaurants by name or cuisine</Text>
      </View>
    );
  }, [isLoading, error, refresh, query, restaurants.length]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or cuisines"
          placeholderTextColor={Colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsFilterSheetVisible(true)}
        >
          <Ionicons name="filter" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {filteredRestaurants.length > 0 ? (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'result' : 'results'}
            </Text>
          }
        />
      ) : (
        renderEmptyState()
      )}

      <FilterSheet
        visible={isFilterSheetVisible}
        onClose={() => setIsFilterSheetVisible(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        isPremium={isPremium}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.text,
  },
  filterButton: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
});
