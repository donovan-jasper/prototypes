import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getSavedLocations, removeLocation } from '@/services/database';
import { Establishment } from '@/types';
import SafetyBadge from '@/components/SafetyBadge';
import { Ionicons } from '@expo/vector-icons';

const SavedLocationsScreen = () => {
  const router = useRouter();
  const [savedLocations, setSavedLocations] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedLocations = useCallback(async () => {
    try {
      setLoading(true);
      const locations = await getSavedLocations();
      setSavedLocations(locations);
    } catch (err) {
      setError('Failed to load saved locations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedLocations();
  }, [fetchSavedLocations]);

  const handleRemoveLocation = async (establishmentId: string) => {
    try {
      await removeLocation(establishmentId);
      // Refresh the list
      await fetchSavedLocations();
      Alert.alert('Location removed', 'This establishment has been removed from your saved locations.');
    } catch (err) {
      Alert.alert('Error', 'Failed to remove location. Please try again.');
      console.error(err);
    }
  };

  const renderItem = ({ item }: { item: Establishment }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push({
        pathname: '/establishment/[id]',
        params: { id: item.establishmentId }
      })}
    >
      <View style={styles.itemContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
        <View style={styles.scoreContainer}>
          <SafetyBadge grade={item.safetyScore} size={24} />
          <Text style={styles.lastInspection}>
            Last inspected: {new Date(item.lastInspectionDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveLocation(item.establishmentId)}
      >
        <Ionicons name="trash-outline" size={24} color="#ff3b30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchSavedLocations}>
          <Text style={styles.retryButton}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (savedLocations.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>You haven't saved any locations yet.</Text>
        <Text style={styles.emptySubtext}>Save locations to receive recall alerts and track their safety scores.</Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.exploreButtonText}>Explore Nearby</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedLocations}
        renderItem={renderItem}
        keyExtractor={(item) => item.establishmentId}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastInspection: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  removeButton: {
    padding: 8,
  },
});

export default SavedLocationsScreen;
