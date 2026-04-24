import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchAnalytics } from '../services/analytics';

const DashboardScreen = ({ navigation }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadApps = async () => {
      try {
        // Replace with actual app IDs from your database or API
        const appIds = ['com.example.app1', 'com.example.app2', 'com.example.app3'];
        const appsData = await Promise.all(appIds.map(id => fetchAnalytics(id)));
        setApps(appsData.filter(app => app !== null));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  if (loading) {
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
        <Text style={styles.errorText}>Error loading apps: {error}</Text>
      </View>
    );
  }

  if (apps.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No apps found. Please add apps to your dashboard.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Apps</Text>
      <FlatList
        data={apps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.appCard}
            onPress={() => navigation.navigate('Analytics', { appId: item.id })}
            activeOpacity={0.7}
          >
            <View style={styles.appHeader}>
              <Text style={styles.appName}>{item.name}</Text>
              <Text style={styles.appId}>{item.id}</Text>
            </View>
            <View style={styles.metricsContainer}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Sales</Text>
                <Text style={styles.metricValue}>{item.sales?.toLocaleString() || 'N/A'}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Rating</Text>
                <Text style={styles.metricValue}>{item.ratings?.toFixed(1) || 'N/A'}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Downloads</Text>
                <Text style={styles.metricValue}>{item.downloads?.toLocaleString() || 'N/A'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  appCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appHeader: {
    marginBottom: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  appId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricBox: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default DashboardScreen;
