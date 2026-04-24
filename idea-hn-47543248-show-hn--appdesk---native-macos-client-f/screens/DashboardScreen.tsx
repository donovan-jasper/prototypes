import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchUserApps, AppData } from '../services/apps';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [apps, setApps] = useState<AppData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadApps = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userApps = await fetchUserApps();
      setApps(userApps);
    } catch (error) {
      console.error('Failed to load apps:', error);
      setError('Failed to load your apps. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadApps();
  };

  const renderAppItem = ({ item }: { item: AppData }) => (
    <TouchableOpacity
      style={styles.appCard}
      onPress={() => navigation.navigate('Analytics', { appId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.appInfo}>
        <Image
          source={{ uri: item.iconUrl }}
          style={styles.appIcon}
          defaultSource={require('../assets/default-app-icon.png')}
        />
        <View style={styles.appDetails}>
          <Text style={styles.appName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.appRating}>⭐ {item.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount.toLocaleString()} reviews)</Text>
          </View>
          <Text style={styles.appDownloads}>📊 {item.downloads.toLocaleString()} downloads</Text>
        </View>
      </View>
      <View style={styles.appStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.sales.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Sales</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
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
        <TouchableOpacity style={styles.retryButton} onPress={loadApps}>
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
          <TouchableOpacity
            style={styles.addAppButton}
            onPress={() => navigation.navigate('AddApp')}
          >
            <Text style={styles.addAppButtonText}>Add App</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={apps}
          renderItem={renderAppItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
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
    fontSize: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  addAppButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addAppButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  appRating: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  appDownloads: {
    fontSize: 14,
    color: '#666',
  },
  appStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
});

export default DashboardScreen;
