import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image, Dimensions, Switch } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Event, Coordinates } from '../types/event';
import { encodeGeohash, getGeohashRange, calculateDistance } from '../utils/geohash';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type RootStackParamList = {
  Event: { eventId: string };
};

type VibeMapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Event'>;

const { width, height } = Dimensions.get('window');

const categoryColors = {
  sports: '#4CAF50',
  music: '#FF5722',
  food: '#FFC107',
  arts: '#9C27B0',
  social: '#2196F3',
  other: '#607D8B'
};

const DEFAULT_RADIUS = 5; // km

const VibeMapScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [filters, setFilters] = useState({
    sports: true,
    music: true,
    food: true,
    arts: true,
    social: true,
    other: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<VibeMapScreenNavigationProp>();

  const fetchEvents = useCallback(async (latitude: number, longitude: number) => {
    try {
      // Get geohash range for specified radius
      const geohashes = getGeohashRange(latitude, longitude, DEFAULT_RADIUS);

      // Query Firestore for events in nearby geohashes
      const eventsQuery = query(
        collection(db, 'events'),
        where('geohash', 'in', geohashes)
      );

      const querySnapshot = await getDocs(eventsQuery);
      const fetchedEvents: Event[] = [];

      querySnapshot.forEach((doc) => {
        const eventData = doc.data() as Event;
        const distance = calculateDistance(
          latitude,
          longitude,
          eventData.latitude,
          eventData.longitude
        );

        if (distance <= DEFAULT_RADIUS) { // Filter events within specified radius
          fetchedEvents.push({
            ...eventData,
            id: doc.id,
            distance
          });
        }
      });

      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    }
  }, []);

  const fetchLocationAndEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        maximumAge: 10000,
        timeout: 15000
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      setMapRegion({
        latitude,
        longitude,
        longitudeDelta: 0.05,
        latitudeDelta: 0.05,
      });

      await fetchEvents(latitude, longitude);

      // Animate map to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      setError('Failed to get your location');
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  useFocusEffect(
    useCallback(() => {
      fetchLocationAndEvents();
    }, [fetchLocationAndEvents])
  );

  const handleMarkerPress = (eventId: string) => {
    navigation.navigate('Event', { eventId });
  };

  const handleRecenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const getMarkerSize = (participants: number) => {
    const baseSize = 30;
    const maxSize = 60;
    const participantCount = Math.min(participants, 20); // Cap at 20 for reasonable scaling
    return baseSize + (participantCount / 20) * (maxSize - baseSize);
  };

  const toggleFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredEvents = events.filter(event => filters[event.category as keyof typeof filters]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading nearby events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLocationAndEvents}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        showsUserLocation={true}
        followsUserLocation={true}
        onRegionChangeComplete={(region) => setMapRegion(region)}
      >
        {filteredEvents.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude
            }}
            onPress={() => handleMarkerPress(event.id)}
            pinColor={categoryColors[event.category as keyof typeof categoryColors] || categoryColors.other}
            tracksViewChanges={false}
          >
            <View style={[
              styles.markerContainer,
              { width: getMarkerSize(event.participants.length), height: getMarkerSize(event.participants.length) }
            ]}>
              <Image
                source={require('../../assets/icons/pin.png')}
                style={[
                  styles.markerIcon,
                  { tintColor: categoryColors[event.category as keyof typeof categoryColors] || categoryColors.other }
                ]}
              />
              <Text style={styles.markerText}>{event.participants.length}</Text>
            </View>
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{event.title}</Text>
                <Text style={styles.calloutDistance}>{event.distance?.toFixed(1)} km away</Text>
                <Text style={styles.calloutParticipants}>{event.participants.length} going</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
        <Image source={require('../../assets/icons/location.png')} style={styles.recenterIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
        <Image source={require('../../assets/icons/filter.png')} style={styles.filterIcon} />
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Filter Events</Text>
          {Object.keys(filters).map((category) => (
            <View key={category} style={styles.filterItem}>
              <Text style={styles.filterLabel}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
              <Switch
                value={filters[category as keyof typeof filters]}
                onValueChange={() => toggleFilter(category)}
                trackColor={{ false: '#767577', true: categoryColors[category as keyof typeof categoryColors] || '#81b0ff' }}
                thumbColor={filters[category as keyof typeof filters] ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  markerText: {
    position: 'absolute',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  calloutContainer: {
    width: 150,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  calloutDistance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  calloutParticipants: {
    fontSize: 12,
    color: '#4CAF50',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recenterIcon: {
    width: 20,
    height: 20,
  },
  filterButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  filterPanel: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  filterTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
  },
});

export default VibeMapScreen;
