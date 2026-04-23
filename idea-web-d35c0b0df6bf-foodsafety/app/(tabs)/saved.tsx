import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getSavedLocations, removeLocation, getUnreadRecallAlertCount } from '@/services/database';
import { SavedLocation } from '@/types';
import SafetyBadge from '@/components/SafetyBadge';
import { Ionicons } from '@expo/vector-icons';

const SavedLocationsScreen = () => {
  const router = useRouter();
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadAlerts, setUnreadAlerts] = useState<Record<string, number>>({});

  const fetchSavedLocations = useCallback(async () => {
    try {
      setLoading(true);
      const locations = await getSavedLocations();
      setSavedLocations(locations);

      // Get unread alert counts for each location
      const alertCounts: Record<string, number> = {};
      for (const location of locations) {
        const count = await getUnreadRecallAlertCountForLocation(location.establishmentId);
        alertCounts[location.establishmentId] = count;
      }
      setUnreadAlerts(alertCounts);
    } catch (error) {
      console.error('Error fetching saved locations:', error);
      Alert.alert('Error', 'Failed to load saved locations');
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnreadRecallAlertCountForLocation = async (establishmentId: string): Promise<number> => {
    try {
      const count = await getUnreadRecallAlertCount();
      // In a real app, we would filter by establishmentId
      return count;
    } catch (error) {
      console.error('Error getting unread alert count:', error);
      return 0;
    }
  };

  useEffect(() => {
    fetchSavedLocations();
  }, [fetchSavedLocations]);

  const handleRemoveLocation = async (establishmentId: string) => {
    try {
      await removeLocation(establishmentId);
      setSavedLocations(prev => prev.filter(loc => loc.establishmentId !== establishmentId));
      Alert.alert('Success', 'Location removed from your saved list');
    } catch (error) {
      console.error('Error removing location:', error);
      Alert.alert('Error', 'Failed to remove location');
    }
  };

  const handleLocationPress = (establishmentId: string) => {
    router.push({
      pathname: '/establishment/[id]',
      params: { id: establishmentId }
    });
  };

  const renderItem = ({ item }: { item: SavedLocation }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationPress(item.establishmentId)}
    >
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationAddress}>{item.address}</Text>
        <View style={styles.locationDetails}>
          <SafetyBadge grade={item.safetyScore} size={24} />
          <Text style={styles.lastInspection}>
            Last inspected: {new Date(item.lastInspectionDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        {unreadAlerts[item.establishmentId] > 0 && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{unreadAlerts[item.establishmentId]}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveLocation(item.establishmentId)}
        >
          <Ionicons name="trash-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (savedLocations.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>You haven't saved any locations yet.</Text>
        <Text style={styles.emptySubtext}>Save locations to receive recall alerts and track your favorite spots.</Text>
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
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  listContent: {
    padding: 16,
  },
  locationItem: {
    backgroundColor: 'white',
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
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastInspection: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBadge: {
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  alertBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 8,
  },
});

export default SavedLocationsScreen;
