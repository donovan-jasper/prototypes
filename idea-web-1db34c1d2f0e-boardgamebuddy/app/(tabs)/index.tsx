import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useLocation } from '../../lib/location';
import { getHangoutsNearby } from '../../lib/database';
import HangoutCard from '../../components/HangoutCard';
import { useFilters } from '../../store/filters';

// Initialize database
const db = SQLite.openDatabaseSync('hobbyhub.db');

interface Hangout {
  id: string;
  title: string;
  hobby: string;
  distance: number; // in miles
  startTime: string;
  attendees: number;
  maxAttendees: number;
  latitude: number;
  longitude: number;
}

export default function ProximityFeedScreen() {
  const router = useRouter();
  const { location, requestLocationPermission } = useLocation();
  const { selectedHobbies, timeRange } = useFilters();
  const [hangouts, setHangouts] = useState<Hangout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load hangouts from database
  useEffect(() => {
    loadHangouts();
  }, [location, selectedHobbies, timeRange]);

  const loadHangouts = async () => {
    try {
      setError(null);
      if (!location) {
        await requestLocationPermission();
        return;
      }

      setLoading(true);
      const nearbyHangouts = await getHangoutsNearby(
        location.latitude,
        location.longitude,
        5, // 5 mile radius
        selectedHobbies,
        timeRange
      );

      setHangouts(nearbyHangouts);
    } catch (error) {
      console.error('Error loading hangouts:', error);
      setError('Failed to load hangouts. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHangouts();
  };

  const handleJoinHangout = (hangoutId: string) => {
    // In a real app, this would handle joining logic
    Alert.alert('Join Hangout', `Would you like to join this hangout?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Join', onPress: () => console.log(`Joined hangout ${hangoutId}`) }
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading nearby hangouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHangouts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={hangouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HangoutCard
            hangout={item}
            onJoin={handleJoinHangout}
            onPress={() => router.push(`/hangout/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hangouts found nearby</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters or create a new hangout</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create')}
            >
              <Text style={styles.createButtonText}>Create Hangout</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
