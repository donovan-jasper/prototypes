import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useRequests } from '../../hooks/useRequests';
import { getCurrentLocation } from '../../lib/location';
import RequestCard from '../../components/RequestCard';

export default function RequestBoard() {
  const router = useRouter();
  const { user } = useAuth();
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [radius, setRadius] = useState(5);
  const { requests, loading, refresh } = useRequests({ ...location, radius });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLocation();
  }, []);

  async function loadLocation() {
    const loc = await getCurrentLocation();
    if (loc) setLocation(loc);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadLocation();
    await refresh();
    setRefreshing(false);
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Please log in to view requests</Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nearby Requests</Text>
          <Text style={styles.subtitle}>{requests.length} requests within {radius} miles</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/request/create')}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.radiusControls}>
        {[0.5, 1, 2, 5].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.radiusButton, radius === r && styles.radiusButtonActive]}
            onPress={() => setRadius(r)}
          >
            <Text style={[styles.radiusButtonText, radius === r && styles.radiusButtonTextActive]}>
              {r} mi
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            userLocation={location}
            onPress={() => router.push(`/request/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No requests nearby</Text>
            <Text style={styles.emptySubtext}>Try increasing your radius or create a new request</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  radiusControls: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  radiusButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  radiusButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
