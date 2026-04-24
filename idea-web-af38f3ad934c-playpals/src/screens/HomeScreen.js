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

  const renderActivityFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.activityFilterContainer}
    >
      {ACTIVITY_TYPES.map((activity) => (
        <TouchableOpacity
          key={activity.name}
          style={[
            styles.activityFilterItem,
            selectedActivity === activity.name && styles.activityFilterItemSelected
          ]}
          onPress={() => setSelectedActivity(selectedActivity === activity.name ? null : activity.name)}
        >
          <Text style={styles.activityFilterText}>{activity.emoji} {activity.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Finding nearby activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities or locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {renderActivityFilter()}

      <View style={styles.distanceFilterContainer}>
        <Text style={styles.distanceFilterLabel}>Show activities within:</Text>
        <Text style={styles.distanceFilterValue}>{distanceFilter} miles</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredEvents}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>No activities found matching your criteria</Text>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  activityFilterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activityFilterItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  activityFilterItemSelected: {
    backgroundColor: '#4CAF50',
  },
  activityFilterText: {
    color: '#333',
  },
  distanceFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  distanceFilterLabel: {
    fontSize: 14,
    color: '#666',
  },
  distanceFilterValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 10,
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  userBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
