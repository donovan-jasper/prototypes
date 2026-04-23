import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, TouchableOpacity, Keyboard } from 'react-native';
import { useRestaurants } from '@/hooks/useRestaurants';
import RestaurantCard from '@/components/RestaurantCard';
import FilterSheet from '@/components/FilterSheet';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';
import { Restaurant, FilterOptions } from '@/types';

const SearchScreen = () => {
  const router = useRouter();
  const {
    restaurants,
    isLoading,
    error,
    location,
    isOffline,
    searchRestaurants,
    applyPremiumFilters,
  } = useRestaurants();
  const { isPremium } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => {
        searchRestaurants(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchRestaurants]);

  useEffect(() => {
    if (restaurants.length > 0) {
      const filtered = applyPremiumFilters(restaurants, filters);
      setFilteredRestaurants(filtered);
    }
  }, [restaurants, filters, applyPremiumFilters]);

  const handleRestaurantPress = (restaurantId: string) => {
    router.push(`/restaurant/${restaurantId}`);
  };

  const handleFilterApply = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    if (searchQuery.length > 2) {
      searchRestaurants(searchQuery);
    }
  };

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item.id)}
      showDistance={true}
      userLocation={location?.coords}
    />
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.emptyText}>Searching for restaurants...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => searchRestaurants(searchQuery)}>
            <Text style={styles.retryButtonText}>Retry Search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery.length <= 2) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Enter at least 3 characters to search</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No restaurants found matching your search</Text>
        <Text style={styles.emptySubtext}>Try a different search term or adjust your filters</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or cuisines"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          autoFocus={true}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode - Showing cached data</Text>
        </View>
      )}

      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps="handled"
      />

      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
        initialFilters={filters}
        isPremium={isPremium}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  filterButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
});

export default SearchScreen;
