import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { generateMockEvents } from '../utils/mockEventGenerator';

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null); // Stores the user's current location object
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setLoading(false);
        // Optionally, set a default location or show an error state
        // For now, if permission is denied, events won't load based on user location.
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    // Only load events once location is available
    if (location) {
      loadEvents(location.coords.latitude, location.coords.longitude);
    }
  }, [location]); // Depend on location state

  // Modified to accept user's latitude and longitude
  const loadEvents = (userLat, userLon) => {
    // Pass user's coordinates to the mock event generator
    const mockEvents = generateMockEvents(userLat, userLon);
    setEvents(mockEvents);
  };

  const handleRefresh = () => {
    if (location) { // Ensure location is available before refreshing
      setRefreshing(true);
      // Simulate network request or data fetching delay
      setTimeout(() => {
        loadEvents(location.coords.latitude, location.coords.longitude);
        setRefreshing(false);
      }, 500);
    } else {
      console.warn("Cannot refresh events: user location not available.");
      setRefreshing(false); // Ensure refreshing state is reset even if location is missing
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Event', { event: item })}>
      <View style={styles.eventItem}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventEmoji}>{item.emoji}</Text>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventLocation}>{item.location}</Text>
          </View>
          <Text style={styles.eventDistance}>{item.distance} mi</Text>
        </View>
        <View style={styles.eventDetails}>
          <Text style={styles.eventTime}>🕐 {item.time}</Text>
          <Text style={styles.eventParticipants}>
            👥 {item.currentParticipants}/{item.maxCapacity}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Finding activities near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Nearby Activities</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing || !location} // Disable refresh if loading or no location
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? '↻' : '🔄'} Refresh
          </Text>
        </TouchableOpacity>
      </View>
      {events.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No activities found nearby</Text>
          <Text style={styles.emptySubtext}>Check back soon!</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing} // Enable pull-to-refresh indicator
          onRefresh={handleRefresh} // Handle pull-to-refresh action
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  eventItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  eventDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
  },
  eventParticipants: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
