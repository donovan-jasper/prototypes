import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { getNearbyEstablishments } from '@/services/api';
import { Establishment } from '@/types';
import SafetyBadge from '@/components/SafetyBadge';
import { registerBackgroundService } from '@/services/backgroundService';
import { requestNotificationPermissions, setupNotificationHandlers } from '@/services/notifications';
import { initializeDatabase } from '@/services/database';

const MapScreen = () => {
  const router = useRouter();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstablishments = useCallback(async (latitude: number, longitude: number) => {
    try {
      const data = await getNearbyEstablishments(latitude, longitude);
      setEstablishments(data);
    } catch (err) {
      setError('Failed to load nearby establishments');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await initializeDatabase();

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setLoading(false);
          return;
        }

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // Fetch establishments
        await fetchEstablishments(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );

        // Request notification permissions
        await requestNotificationPermissions();

        // Setup notification handlers
        setupNotificationHandlers();

        // Register background service
        await registerBackgroundService();

        setLoading(false);
      } catch (err) {
        setError('Failed to initialize app');
        setLoading(false);
        console.error(err);
      }
    };

    initializeApp();
  }, [fetchEstablishments]);

  const handleMarkerPress = (establishment: Establishment) => {
    router.push({
      pathname: '/establishment/[id]',
      params: { id: establishment.id }
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your food safety map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Text style={styles.searchLink}>Try searching instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
        >
          {establishments.map((establishment) => (
            <Marker
              key={establishment.id}
              coordinate={{
                latitude: establishment.latitude,
                longitude: establishment.longitude,
              }}
              onPress={() => handleMarkerPress(establishment)}
            >
              <SafetyBadge grade={establishment.safetyScore} size={32} />
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchLink: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default MapScreen;
