import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Slider } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useRequests } from '../../hooks/useRequests';
import { getCurrentLocation, requestLocationPermission } from '../../lib/location';
import RequestCard from '../../components/RequestCard';
import { Ionicons } from '@expo/vector-icons';

export default function RequestBoard() {
  const router = useRouter();
  const { user } = useAuth();
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [radius, setRadius] = useState(5);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const { requests, loading, refresh } = useRequests({ ...location, radius });
  const [refreshing, setRefreshing] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    if (location.latitude !== 0 && location.longitude !== 0) {
      setMapRegion({
        ...mapRegion,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location]);

  async function checkLocationPermission() {
    const hasPermission = await requestLocationPermission();
    setLocationPermission(hasPermission);

    if (hasPermission) {
      const loc = await getCurrentLocation();
      if (loc) {
        setLocation(loc);
        setMapRegion({
          ...mapRegion,
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      }
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    if (locationPermission) {
      const loc = await getCurrentLocation();
      if (loc) {
        setLocation(loc);
        setMapRegion({
          ...mapRegion,
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      }
    }
    await refresh();
    setRefreshing(false);
  }

  function handleCreateRequest() {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to create a request');
      return;
    }
    router.push('/request/create');
  }

  if (locationPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Checking location permissions...</Text>
      </View>
    );
  }

  if (!locationPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Location access required</Text>
        <Text style={styles.emptySubtext}>Please enable location services to see nearby requests</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={checkLocationPermission}
        >
          <Text style={styles.permissionButtonText}>Retry Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Please log in to view requests</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {requests.map((request) => (
            <Marker
              key={request.id}
              coordinate={{
                latitude: request.latitude,
                longitude: request.longitude,
              }}
              title={request.title}
              description={request.description}
              onCalloutPress={() => router.push(`/request/${request.id}`)}
            >
              <View style={styles.marker}>
                <Text style={styles.markerText}>$</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.radiusSliderContainer}>
        <Text style={styles.radiusLabel}>Search Radius: {radius} miles</Text>
        <Slider
          style={styles.slider}
          minimumValue={0.5}
          maximumValue={5}
          step={0.5}
          value={radius}
          onValueChange={(value) => setRadius(value)}
          minimumTrackTintColor="#6366f1"
          maximumTrackTintColor="#d1d5db"
          thumbTintColor="#6366f1"
        />
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nearby Requests</Text>
          <Text style={styles.subtitle}>{requests.length} requests within {radius} miles</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              userLocation={location}
              onPress={() => router.push(`/request/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No requests nearby</Text>
              <Text style={styles.emptySubtext}>Try increasing your radius or create a new request</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateRequest}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  mapContainer: {
    height: 250,
    width: '100%',
    marginBottom: 10,
  },
  map: {
    flex: 1,
  },
  marker: {
    backgroundColor: '#6366f1',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  radiusSliderContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  radiusLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6b7280',
  },
  permissionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
