import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMockEvents } from '../utils/mockEventGenerator';

const ACTIVITY_TYPES = [
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Yoga', emoji: '🧘' },
  { name: 'Frisbee', emoji: '🥏' },
  { name: 'Soccer', emoji: '⚽' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Running', emoji: '🏃' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Cycling', emoji: '🚴' },
  { name: 'Hiking', emoji: '🥾' },
  { name: 'Pickleball', emoji: '🏓' },
];

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [selectedActivity, setSelectedActivity] = useState(null);

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

  useEffect(() => {
    applyFilters();
  }, [events, distanceFilter, selectedActivity]);

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

  const applyFilters = () => {
    let filtered = [...events];

    if (selectedActivity) {
      filtered = filtered.filter(event => event.title === selectedActivity);
    }

    filtered = filtered.filter(event => event.distance <= distanceFilter);

    setFilteredEvents(filtered);
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

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Activity Type:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activityScroll}>
          {ACTIVITY_TYPES.map((activity) => (
            <TouchableOpacity
              key={activity.name}
              style={[
                styles.activityButton,
                selectedActivity === activity.name && styles.selectedActivityButton
              ]}
              onPress={() => setSelectedActivity(selectedActivity === activity.name ? null : activity.name)}
            >
              <Text style={styles.activityButtonText}>{activity.emoji} {activity.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.distanceFilter}>
          <Text style={styles.filterLabel}>Max Distance: {distanceFilter} miles</Text>
          <TextInput
            style={styles.distanceInput}
            keyboardType="numeric"
            value={distanceFilter.toString()}
            onChangeText={(text) => setDistanceFilter(text ? parseFloat(text) : 0)}
          />
        </View>
      </View>

      {filteredEvents.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No activities found nearby</Text>
          <Text style={styles.emptySubtext}>Check back soon!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
  },
  filtersContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  activityScroll: {
    marginBottom: 15,
  },
  activityButton: {
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedActivityButton: {
    backgroundColor: '#007AFF',
  },
  activityButtonText: {
    color: '#333',
  },
  distanceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distanceInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  eventItem: {
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
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  eventDistance: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
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
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  userBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
