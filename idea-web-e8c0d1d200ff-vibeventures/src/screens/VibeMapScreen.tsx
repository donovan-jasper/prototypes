import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
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
      // Get geohash range for 5km radius
      const geohashes = getGeohashRange(latitude, longitude, 5);

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

        if (distance <= 5) { // Filter events within 5km
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

      const location = await Location.getCurrentPositionAsync({});
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
        showsMyLocationButton={false}
        loadingEnabled={true}
        loadingIndicatorColor="#007AFF"
        loadingBackgroundColor="#ffffff"
      >
        {events.map((event) => {
          const markerSize = getMarkerSize(event.participants.length);
          const markerColor = categoryColors[event.category] || categoryColors.other;

          return (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude
              }}
              onPress={() => handleMarkerPress(event.id)}
              tracksViewChanges={false}
            >
              <View style={[
                styles.markerContainer,
                {
                  width: markerSize,
                  height: markerSize,
                  borderRadius: markerSize / 2,
                  backgroundColor: markerColor
                }
              ]}>
                <Text style={styles.markerText}>
                  {event.participants.length}
                </Text>
              </View>
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{event.title}</Text>
                  <Text style={styles.calloutDistance}>
                    {event.distance?.toFixed(1)} km away
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity
        style={styles.recenterButton}
        onPress={handleRecenter}
      >
        <Image
          source={require('../../assets/icons/location.png')}
          style={styles.recenterIcon}
        />
      </TouchableOpacity>

      {events.length === 0 && (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No events found nearby</Text>
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
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
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
    color: '#fff',
    fontSize: 16,
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  calloutContainer: {
    width: 150,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutDistance: {
    fontSize: 12,
    color: '#666',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recenterIcon: {
    width: 24,
    height: 24,
  },
  noEventsContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  noEventsText: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    color: '#666',
  },
});

export default VibeMapScreen;
