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
            <Text style={styles.eventTime}>{item.time}</Text>
            <Text style={styles.eventDistance}>{item.distance} mi</Text>
          </View>
        </View>
        <View style={styles.eventFooter}>
          <Text style={styles.eventParticipants}>
            {item.currentParticipants}/{item.maxCapacity} spots
          </Text>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinEvent(item)}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleJoinEvent = async (event) => {
    try {
      // Check if event is full
      if (event.currentParticipants >= event.maxCapacity) {
        Alert.alert('Event Full', 'This event has reached its maximum capacity.');
        return;
      }

      // Update participant count
      const updatedEvent = {
        ...event,
        currentParticipants: event.currentParticipants + 1
      };

      // Update in AsyncStorage if it's a user-created event
      if (event.createdBy === 'user') {
        const storedEvents = await AsyncStorage.getItem('userEvents');
        const userEvents = storedEvents ? JSON.parse(storedEvents) : [];
        const updatedEvents = userEvents.map(e =>
          e.id === event.id ? updatedEvent : e
        );
        await AsyncStorage.setItem('userEvents', JSON.stringify(updatedEvents));
      }

      // Update local state
      setEvents(prevEvents =>
        prevEvents.map(e => e.id === event.id ? updatedEvent : e)
      );

      Alert.alert('Success', 'You have joined the event!');
    } catch (error) {
      console.error('Error joining event:', error);
      Alert.alert('Error', 'Could not join the event. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SpontaPlay</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Text style={styles.createButtonText}>+ Create Event</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              !selectedActivity && styles.selectedFilter
            ]}
            onPress={() => setSelectedActivity(null)}
          >
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          {ACTIVITY_TYPES.map(activity => (
            <TouchableOpacity
              key={activity.name}
              style={[
                styles.filterButton,
                selectedActivity === activity.name && styles.selectedFilter
              ]}
              onPress={() => setSelectedActivity(activity.name)}
            >
              <Text style={styles.filterText}>{activity.emoji} {activity.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.distanceFilter}>
        <Text style={styles.distanceText}>Distance: Within {distanceFilter} miles</Text>
        <TextInput
          style={styles.distanceInput}
          value={distanceFilter.toString()}
          onChangeText={(text) => {
            const num = parseFloat(text);
            if (!isNaN(num) && num >= 0) {
              setDistanceFilter(num);
            }
          }}
          keyboardType="numeric"
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredEvents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
    backgroundColor: '#F5F5F5',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  filtersContainer: {
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  selectedFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#333',
    fontSize: 14,
  },
  distanceFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  distanceText: {
    fontSize: 14,
    color: '#555',
  },
  distanceInput: {
    width: 50,
    padding: 5,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    textAlign: 'center',
  },
  listContent: {
    padding: 10,
  },
  eventItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 16,
    fontWeight: '600',
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
  eventTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  eventDistance: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  eventParticipants: {
    fontSize: 14,
    color: '#555',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
