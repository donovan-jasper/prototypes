import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useBroadcastStore } from '../../store/broadcastStore';
import BroadcastCard from '../../components/BroadcastCard';
import { getCurrentLocation } from '../../lib/location';
import { fetchNearbyBroadcasts, expressInterest } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function FeedScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const {
    broadcasts,
    setBroadcasts,
    loading,
    setLoading,
    subscribeToBroadcasts,
    unsubscribeFromBroadcasts
  } = useBroadcastStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(3);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const radiusOptions = [0.5, 1, 3, 5];

  useEffect(() => {
    loadLocation();

    return () => {
      unsubscribeFromBroadcasts();
    };
  }, []);

  useEffect(() => {
    if (userLocation && selectedRadius) {
      loadBroadcasts();
      setupRealTimeSubscription();
    }
  }, [userLocation, selectedRadius]);

  const loadLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setLocationError(null);
    } catch (error) {
      setLocationError('Unable to get location. Please enable location services.');
    }
  };

  const loadBroadcasts = async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      const data = await fetchNearbyBroadcasts(
        userLocation.latitude,
        userLocation.longitude,
        selectedRadius
      );
      setBroadcasts(data);
    } catch (error) {
      console.error('Error loading broadcasts:', error);
      setLocationError('Failed to load broadcasts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = useCallback(() => {
    if (!userLocation) return;

    unsubscribeFromBroadcasts();

    const subscription = subscribeToBroadcasts(
      { lat: userLocation.latitude, lng: userLocation.longitude },
      selectedRadius,
      (newBroadcasts) => {
        setBroadcasts(newBroadcasts);
      }
    );

    return () => subscription.unsubscribe();
  }, [userLocation, selectedRadius]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocation();
    if (userLocation) {
      await loadBroadcasts();
    }
    setRefreshing(false);
  };

  const handleExpressInterest = async (broadcastId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to express interest in broadcasts');
      return;
    }

    try {
      setLoading(true);
      const result = await expressInterest(broadcastId, user.id);

      // Update the broadcasts list to reflect the interest
      const updatedBroadcasts = broadcasts.map(broadcast =>
        broadcast.id === broadcastId
          ? { ...broadcast, interested: true }
          : broadcast
      );
      setBroadcasts(updatedBroadcasts);

      if (result.isUnlocked) {
        router.push(`/chat/${result.chatId}`);
      }

      return result;
    } catch (error) {
      console.error('Error expressing interest:', error);
      Alert.alert('Error', 'Failed to express interest. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{locationError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadLocation}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Now</Text>
        <View style={styles.radiusSelector}>
          {radiusOptions.map((radius) => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusButton,
                selectedRadius === radius && styles.radiusButtonActive,
              ]}
              onPress={() => setSelectedRadius(radius)}
            >
              <Text
                style={[
                  styles.radiusButtonText,
                  selectedRadius === radius && styles.radiusButtonTextActive,
                ]}
              >
                {radius}mi
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : broadcasts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No broadcasts nearby</Text>
          <Text style={styles.emptySubtext}>
            Be the first to create one!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/create')}
          >
            <Text style={styles.createButtonText}>Create Broadcast</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={broadcasts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BroadcastCard
              broadcast={item}
              onInterest={handleExpressInterest}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  radiusSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  radiusButtonActive: {
    backgroundColor: '#007AFF',
  },
  radiusButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  radiusButtonTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    color: '#666',
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
    fontWeight: 'bold',
  },
  listContent: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
