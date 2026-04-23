import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
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
        <TouchableOpacity onPress={fetchLocationAndEvents} style={styles.retryButton}>
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
        region={mapRegion}
        showsUserLocation={true}
        followsUserLocation={true}
        onRegionChangeComplete={(region) => setMapRegion(region)}
        provider={PROVIDER_GOOGLE}
        loadingEnabled={true}
        loadingIndicatorColor="#007AFF"
        loadingBackgroundColor="transparent"
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="You are here"
            pinColor="#007AFF"
          />
        )}

        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            onPress={() => handleMarkerPress(event.id)}
            pinColor={categoryColors[event.category] || categoryColors.other}
          >
            <View style={[
              styles.markerContainer,
              {
                width: getMarkerSize(event.participants),
                height: getMarkerSize(event.participants),
                borderRadius: getMarkerSize(event.participants) / 2,
                backgroundColor: categoryColors[event.category] || categoryColors.other,
              }
            ]}>
              <Text style={styles.markerText}>{event.participants}</Text>
            </View>
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{event.title}</Text>
                <Text style={styles.calloutDistance}>
                  {event.distance.toFixed(1)} km away
                </Text>
                <Text style={styles.calloutParticipants}>
                  {event.participants} people going
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.recenterButton}
        onPress={handleRecenter}
        accessibilityLabel="Recenter map on your location"
      >
        <Image
          source={require('../../assets/location-arrow.png')}
          style={styles.recenterIcon}
        />
      </TouchableOpacity>

      {events.length === 0 && (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No events found nearby</Text>
          <Text style={styles.noEventsSubtext}>Try adjusting your search radius</Text>
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
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  calloutContainer: {
    width: 150,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
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
    color: '#666',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recenterIcon: {
    width: 20,
    height: 20,
  },
  noEventsContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
});

export default VibeMapScreen;
