import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
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

  useEffect(() => {
    const fetchLocationAndEvents = async () => {
      try {
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
        setLoading(false);

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
        console.error('Error fetching data:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    };

    fetchLocationAndEvents();
  }, []);

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
      >
        {events.map((event) => {
          const markerSize = getMarkerSize(event.participants.length);
          const markerColor = categoryColors[event.category] || categoryColors.other;

          return (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              title={event.title}
              onPress={() => handleMarkerPress(event.id)}
            >
              <View style={[
                styles.markerContainer,
                {
                  width: markerSize,
                  height: markerSize,
                  borderColor: markerColor,
                  backgroundColor: `${markerColor}33` // Add transparency
                }
              ]}>
                <Image
                  source={{ uri: event.imageUrl || 'https://via.placeholder.com/40' }}
                  style={[
                    styles.markerImage,
                    {
                      width: markerSize * 0.7,
                      height: markerSize * 0.7,
                      borderRadius: markerSize * 0.35
                    }
                  ]}
                />
                <View style={[
                  styles.markerBadge,
                  {
                    backgroundColor: markerColor,
                    width: markerSize * 0.6,
                    height: markerSize * 0.6,
                    borderRadius: markerSize * 0.3,
                    top: -markerSize * 0.3,
                    right: -markerSize * 0.3
                  }
                ]}>
                  <Text style={[
                    styles.markerBadgeText,
                    { fontSize: markerSize * 0.3 }
                  ]}>
                    {event.participants.length}
                  </Text>
                </View>
              </View>
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{event.title}</Text>
                  <Text style={styles.calloutDistance}>
                    {event.distance.toFixed(1)} km away
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
        <Image
          source={require('../../assets/location-arrow.png')}
          style={styles.recenterIcon}
        />
      </TouchableOpacity>

      <View style={styles.legendContainer}>
        {Object.entries(categoryColors).map(([category, color]) => (
          <View key={category} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{category}</Text>
          </View>
        ))}
      </View>
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
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 50,
    overflow: 'hidden',
  },
  markerImage: {
    resizeMode: 'cover',
  },
  markerBadge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  calloutContainer: {
    width: 150,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  recenterIcon: {
    width: 24,
    height: 24,
  },
  legendContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

export default VibeMapScreen;
