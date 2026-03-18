import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDirectories } from '@/hooks/useDirectories';
import DirectoryCard from '@/components/DirectoryCard';
import FilterSheet from '@/components/FilterSheet';
import { Category } from '@/constants/categories';

export default function DirectoryBrowserScreen() {
  const router = useRouter();
  const { directories, loading, searchDirectories, filterByCategory, refresh } = useDirectories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredDirectories = directories.filter(dir => {
    const matchesSearch = searchQuery === '' || 
      dir.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dir.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(dir.category as Category);
    
    return matchesSearch && matchesCategory;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleDirectoryPress = (id: string) => {
    router.push(`/directory/${id}`);
  };

  const handleApplyFilters = (categories: Category[]) => {
    setSelectedCategories(categories);
    setShowFilters(false);
  };

  if (loading && directories.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading directories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Directories</Text>
        <Text style={styles.subtitle}>
          {filteredDirectories.length} directories available
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search directories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>
            {selectedCategories.length > 0 ? `Filters (${selectedCategories.length})` : 'Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDirectories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DirectoryCard
            directory={item}
            onPress={() => handleDirectoryPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No directories found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />

      <FilterSheet
        visible={showFilters}
        selectedCategories={selectedCategories}
        onApply={handleApplyFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    pad
