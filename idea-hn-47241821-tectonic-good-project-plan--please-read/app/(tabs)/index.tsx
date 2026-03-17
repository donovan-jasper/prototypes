import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { initDatabase, getResourcesByLocation } from '../../services/database';
import { calculateDistance } from '../../services/location';

interface Resource {
  id: number;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  hours: string;
  wheelchair_accessible: boolean;
  pet_friendly: boolean;
  open_now: boolean;
  distance?: number;
}

export default function ResourceFinderScreen() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState(5);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    openNow: false,
    wheelchairAccessible: false,
    petFriendly: false,
    type: 'all'
  });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database
        await initDatabase();

        // Get user location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        // Fetch resources
        const fetchedResources = await getResourcesByLocation(
          location.coords.latitude,
          location.coords.longitude,
          distanceFilter
        );

        // Calculate distance for each resource
        const resourcesWithDistance = fetchedResources.map(resource => ({
          ...resource,
          distance: calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            resource.latitude,
            resource.longitude
          )
        }));

        setResources(resourcesWithDistance);
        setFilteredResources(resourcesWithDistance);
        setLoading(false);
      } catch (err) {
        setError('Failed to load resources');
        setLoading(false);
        console.error(err);
      }
    };

    initialize();
  }, [distanceFilter]);

  useEffect(() => {
    // Apply filters
    let filtered = [...resources];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(resource => resource.type === filters.type);
    }

    // Open now filter
    if (filters.openNow) {
      filtered = filtered.filter(resource => resource.open_now);
    }

    // Wheelchair accessible filter
    if (filters.wheelchairAccessible) {
      filtered = filtered.filter(resource => resource.wheelchair_accessible);
    }

    // Pet friendly filter
    if (filters.petFriendly) {
      filtered = filtered.filter(resource => resource.pet_friendly);
    }

    setFilteredResources(filtered);
  }, [searchQuery, filters, resources]);

  const toggleFilter = (filter: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const renderResourceItem = ({ item }: { item: Resource }) => (
    <View style={styles.resourceCard}>
      <Text style={styles.resourceName}>{item.name}</Text>
      <Text style={styles.resourceType}>{item.type}</Text>
      <Text style={styles.resourceAddress}>{item.address}</Text>
      <Text style={styles.resourceDistance}>{item.distance?.toFixed(1)} km away</Text>
      <View style={styles.resourceDetails}>
        <Text style={styles.resourceHours}>{item.hours}</Text>
        <Text style={styles.resourcePhone}>{item.phone}</Text>
      </View>
      <View style={styles.resourceTags}>
        {item.open_now && <Text style={styles.tag}>Open Now</Text>}
        {item.wheelchair_accessible && <Text style={styles.tag}>Wheelchair Accessible</Text>}
        {item.pet_friendly && <Text style={styles.tag}>Pet Friendly</Text>}
      </View>
      <View style={styles.resourceActions}>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="phone" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="map-marker" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="bookmark" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading resources...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowMap(!showMap)}>
          <FontAwesome name={showMap ? "list" : "map"} size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Distance: {distanceFilter} km</Text>
          <View style={styles.distanceSlider}>
            <TouchableOpacity onPress={() => setDistanceFilter(Math.max(1, distanceFilter - 1))}>
              <FontAwesome name="minus" size={20} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.distanceValue}>{distanceFilter} km</Text>
            <TouchableOpacity onPress={() => setDistanceFilter(distanceFilter + 1)}>
              <FontAwesome name="plus" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Type:</Text>
          <View style={styles.typeFilters}>
            <TouchableOpacity
              style={[styles.typeButton, filters.type === 'all' && styles.typeButtonActive]}
              onPress={() => setFilters(prev => ({ ...prev, type: 'all' }))}
            >
              <Text style={styles.typeButtonText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, filters.type === 'shelter' && styles.typeButtonActive]}
              onPress={() => setFilters(prev => ({ ...prev, type: 'shelter' }))}
            >
              <Text style={styles.typeButtonText}>Shelter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, filters.type === 'food' && styles.typeButtonActive]}
              onPress={() => setFilters(prev => ({ ...prev, type: 'food' }))}
            >
              <Text style={styles.typeButtonText}>Food</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, filters.type === 'legal' && styles.typeButtonActive]}
              onPress={() => setFilters(prev => ({ ...prev, type: 'legal' }))}
            >
              <Text style={styles.typeButtonText}>Legal</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.toggleFilter}>
            <Text style={styles.filterLabel}>Open Now</Text>
            <Switch
              value={filters.openNow}
              onValueChange={() => toggleFilter('openNow')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={filters.openNow ? '#007AFF' : '#f4f3f4'}
            />
          </View>
          <View style={styles.toggleFilter}>
            <Text style={styles.filterLabel}>Wheelchair Accessible</Text>
            <Switch
              value={filters.wheelchairAccessible}
              onValueChange={() => toggleFilter('wheelchairAccessible')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={filters.wheelchairAccessible ? '#007AFF' : '#f4f3f4'}
            />
          </View>
          <View style={styles.toggleFilter}>
            <Text style={styles.filterLabel}>Pet Friendly</Text>
            <Switch
              value={filters.petFriendly}
              onValueChange={() => toggleFilter('petFriendly')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={filters.petFriendly ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {showMap ? (
        <View style={styles.mapContainer}>
          {userLocation && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude
                }}
                title="Your Location"
                pinColor="blue"
              />
              {filteredResources.map(resource => (
                <Marker
                  key={resource.id}
                  coordinate={{
                    latitude: resource.latitude,
                    longitude: resource.longitude
                  }}
                  title={resource.name}
                  description={resource.type}
                />
              ))}
            </MapView>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredResources}
          renderItem={renderResourceItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No resources found matching your criteria</Text>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={() => {
                setSearchQuery('');
                setFilters({
                  openNow: false,
                  wheelchairAccessible: false,
                  petFriendly: false,
                  type: 'all'
                });
              }}>
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  filtersContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  distanceSlider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceValue: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#333',
  },
  typeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 5,
    marginBottom: 5,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    color: '#333',
  },
  toggleFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  listContainer: {
    padding: 10,
  },
  resourceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resourceType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resourceAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resourceDistance: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 10,
  },
  resourceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resourceHours: {
    fontSize: 14,
    color: '#666',
  },
  resourcePhone: {
    fontSize: 14,
    color: '#666',
  },
  resourceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#e0f7fa',
    color: '#00838f',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    color: '#007AFF',
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  clearFiltersButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  clearFiltersText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
