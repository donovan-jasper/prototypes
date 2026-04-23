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
        <Text style={styles.title}>Nearby Requests</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateRequest}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No requests found</Text>
          <Text style={styles.emptySubtext}>Try increasing your search radius or create a new request</Text>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapContainer: {
    height: 200,
    width: '100%',
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    backgroundColor: '#6366f1',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  radiusSliderContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: '#fff',
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
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
