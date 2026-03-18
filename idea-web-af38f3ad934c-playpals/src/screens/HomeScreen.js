import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMockEvents } from '../utils/mockEventGenerator';

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      loadEvents(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (location) {
        loadEvents(location.coords.latitude, location.coords.longitude);
      }
    });

    return unsubscribe;
  }, [navigation, location]);

  const loadEvents = async (userLat, userLon) => {
    const mockEvents = generateMockEvents(userLat, userLon);
    
    try {
      const storedEvents = await AsyncStorage.getItem('userEvents');
      const userEvents = storedEvents ? JSON.parse(storedEvents) : [];
      
      const userEventsWithDistance = userEvents.map(event => {
        const distance = calculateDistance(
          userLat,
          userLon,
          event.latitude,
          event.longitude
        );
        return { ...event, distance };
      });
      
      const allEvents = [...userEventsWithDistance, ...mockEvents];
      allEvents.sort((a, b) => a.distance - b.distance);
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading user events:', error);
      setEvents(mockEvents);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const handleRefresh = () => {
    if (location) {
      setRefreshing(true);
      setTimeout(() => {
        loadEvents(location.coords.latitude, location.coords.longitude);
        setRefreshing(false);
      }, 500);
    } else {
      console.warn("Cannot refresh events: user location not available.");
      setRefreshing(false);
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
        {item.createdBy === 'user' && (
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>Your Activity</Text>
          </View>
        )}
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
          disabled={refreshing || !location}
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
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    paddingBottom: 80,
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
  userBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userBadgeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default HomeScreen;
