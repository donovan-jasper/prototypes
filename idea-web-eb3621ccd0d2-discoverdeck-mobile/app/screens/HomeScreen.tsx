import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getRecommendations } from '../utils/recommendations';
import { AppRecommendation } from '../types/app';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [apps, setApps] = useState<AppRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      const result = await getRecommendations(searchQuery);
      setApps(result.data);
      setLoading(false);
      setError(result.error);
    };

    fetchApps();
  }, [searchQuery]);

  const renderAppItem = ({ item }: { item: AppRecommendation }) => (
    <TouchableOpacity style={styles.appCard} onPress={() => console.log('App selected:', item.name)}>
      <Image source={{ uri: item.iconUrl }} style={styles.appIcon} />
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.appDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>
            {item.expertRating ? `⭐ ${item.expertRating} (Expert)` : `⭐ ${item.rating}`}
          </Text>
          <Text style={styles.reviewCount}>{item.reviewCount} reviews</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Curio</Text>
      <Text style={styles.subtitle}>Discover the best apps for your needs</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search for apps (e.g., productivity, health)"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={apps}
          renderItem={renderAppItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No apps found. Try a different search.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  listContainer: {
    paddingBottom: 20,
  },
  appCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#FF9500',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  loader: {
    marginTop: 40,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default HomeScreen;
