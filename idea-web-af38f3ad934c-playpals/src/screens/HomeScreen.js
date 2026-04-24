import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, RefreshControl } from 'react-native';
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
  const [searchQuery, setSearchQuery] = useState('');
  const flatListRef = useRef(null);

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
      const interval = setInterval(() => {
        loadEvents(location.coords.latitude, location.coords.longitude);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
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
  }, [events, distanceFilter, selectedActivity, searchQuery]);

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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
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
      loadEvents(location.coords.latitude, location.coords.longitude);
      setRefreshing(false);
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
          <View style={styles.eventDetails}>
            <Text style={styles.eventDistance}>{item.distance} mi</Text>
            <Text style={styles.eventTime}>
              {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        <View style={styles.eventFooter}>
          <Text style={styles.eventParticipants}>
            {item.participants} {item.participants === 1 ? 'person' : 'people'} going
          </Text>
          {item.isPopular && <Text style={styles.popularBadge}>Popular</Text>}
          {item.isNew && <Text style={styles.newBadge}>New</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActivityFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.activityFilterContainer}
    >
      <TouchableOpacity
        style={[
          styles.activityFilterItem,
          !selectedActivity && styles.activityFilterItemSelected
        ]}
        onPress={() => setSelectedActivity(null)}
      >
        <Text style={styles.activityFilterText}>All</Text>
      </TouchableOpacity>
      {ACTIVITY_TYPES.map((activity) => (
        <TouchableOpacity
          key={activity.name}
          style={[
            styles.activityFilterItem,
            selectedActivity === activity.name && styles.activityFilterItemSelected
          ]}
          onPress={() => setSelectedActivity(activity.name)}
        >
          <Text style={styles.activityFilterText}>{activity.emoji} {activity.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Finding events near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events or locations"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {renderActivityFilter()}

      <View style={styles.distanceFilterContainer}>
        <Text style={styles.distanceFilterLabel}>Distance: {distanceFilter} miles</Text>
        <View style={styles.distanceSlider}>
          <TouchableOpacity
            style={styles.distanceButton}
            onPress={() => setDistanceFilter(Math.max(1, distanceFilter - 1))}
          >
            <Text style={styles.distanceButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.distanceButton}
            onPress={() => setDistanceFilter(Math.min(20, distanceFilter + 1))}
          >
            <Text style={styles.distanceButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredEvents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events found matching your filters</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  activityFilterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activityFilterItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  activityFilterItemSelected: {
    backgroundColor: '#007AFF',
  },
  activityFilterText: {
    color: '#333',
    fontSize: 14,
  },
  distanceFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  distanceFilterLabel: {
    fontSize: 16,
    color: '#333',
  },
  distanceSlider: {
    flexDirection: 'row',
  },
  distanceButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  distanceButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  eventDetails: {
    alignItems: 'flex-end',
  },
  eventDistance: {
    fontSize: 14,
    color: '#666',
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  eventParticipants: {
    fontSize: 14,
    color: '#666',
  },
  popularBadge: {
    backgroundColor: '#FFD700',
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
