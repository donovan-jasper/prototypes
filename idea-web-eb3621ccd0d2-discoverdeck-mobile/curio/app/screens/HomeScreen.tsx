import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import SearchBar from '../components/SearchBar';
import AppCard from '../components/AppCard';
import { getRecommendations } from '../utils/recommendations';
import { MockApp } from '../data/mockApps';

const HomeScreen: React.FC = () => {
  const [apps, setApps] = useState<MockApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialApps = async () => {
      try {
        const recommendations = await getRecommendations('');
        setApps(recommendations);
        setLoading(false);
      } catch (err) {
        setError('Failed to load recommendations');
        setLoading(false);
      }
    };

    loadInitialApps();
  }, []);

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      const recommendations = await getRecommendations(query);
      setApps(recommendations);
      setLoading(false);
    } catch (err) {
      setError('Failed to search apps');
      setLoading(false);
    }
  };

  const handleInstall = (url: string) => {
    console.log(`Installing app from ${url}`);
    // In a real app, you would use Linking.openURL(url)
  };

  if (loading && apps.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      {apps.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No apps found. Try a different search.</Text>
        </View>
      ) : (
        <FlatList
          data={apps}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => <AppCard app={item} onInstall={handleInstall} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
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
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default HomeScreen;
