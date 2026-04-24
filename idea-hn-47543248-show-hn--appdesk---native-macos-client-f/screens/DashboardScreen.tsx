import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchUserApps, AppData } from '../services/apps';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [apps, setApps] = useState<AppData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApps = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userApps = await fetchUserApps();
        setApps(userApps);
      } catch (error) {
        console.error('Failed to load apps:', error);
        setError('Failed to load your apps. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadApps();
  }, []);

  const renderAppItem = ({ item }: { item: AppData }) => (
    <TouchableOpacity
      style={styles.appCard}
      onPress={() => navigation.navigate('Analytics', { appId: item.id })}
    >
      <View style={styles.appInfo}>
        <Image
          source={{ uri: item.iconUrl }}
          style={styles.appIcon}
          defaultSource={require('../assets/default-app-icon.png')}
        />
        <View style={styles.appDetails}>
          <Text style={styles.appName}>{item.name}</Text>
          <Text style={styles.appRating}>⭐ {item.rating} ({item.reviewCount} reviews)</Text>
          <Text style={styles.appDownloads}>📊 {item.downloads.toLocaleString()} downloads</Text>
        </View>
      </View>
      <View style={styles.appStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${item.revenue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.sales}</Text>
          <Text style={styles.statLabel}>Sales</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your apps...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadApps()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Apps</Text>
      {apps.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No apps found</Text>
          <Text style={styles.emptySubtext}>Add your first app to get started</Text>
        </View>
      ) : (
        <FlatList
          data={apps}
          renderItem={renderAppItem}
          keyExtractor={(item) => item.id}
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
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingBottom: 20,
  },
  appCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  appRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  appDownloads: {
    fontSize: 14,
    color: '#666',
  },
  appStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default DashboardScreen;
