import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { getCurrentLocation, calculateDistance } from '../../services/location';
import { getResourcesByLocation } from '../../services/database';

type ResourceType = {
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
};

const resourceTypes = [
  { id: 'shelter', name: 'Shelters', icon: 'home' },
  { id: 'food', name: 'Food Banks', icon: 'cutlery' },
  { id: 'legal', name: 'Legal Aid', icon: 'gavel' },
  { id: 'health', name: 'Healthcare', icon: 'medkit' },
];

export default function ResourceFinderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceType[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState({
    wheelchair: false,
    petFriendly: false,
    openNow: false,
    selectedTypes: resourceTypes.map(type => type.id),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentLocation = await getCurrentLocation();
        setLocation(currentLocation);

        const allResources = await getResourcesByLocation(
          currentLocation.latitude,
          currentLocation.longitude,
          10 // 10km radius
        );

        // Calculate distance for each resource
        const resourcesWithDistance = allResources.map(resource => ({
          ...resource,
          distance: calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            resource.latitude,
            resource.longitude
          )
        }));

        setResources(resourcesWithDistance);
        setFilteredResources(resourcesWithDistance);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

    // Type filters
    if (filters.selectedTypes.length > 0) {
      filtered = filtered.filter(resource =>
        filters.selectedTypes.includes(resource.type)
      );
    }

    // Accessibility filters
    if (filters.wheelchair) {
      filtered = filtered.filter(resource => resource.wheelchair_accessible);
    }

    if (filters.petFriendly) {
      filtered = filtered.filter(resource => resource.pet_friendly);
    }

    if (filters.openNow) {
      filtered = filtered.filter(resource => resource.open_now);
    }

    setFilteredResources(filtered);
  }, [searchQuery, filters, resources]);

  const toggleFilter = (filter: string) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const toggleTypeFilter = (type: string) => {
    setFilters(prev => {
      const newSelectedTypes = prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type];

      return {
        ...prev,
        selectedTypes: newSelectedTypes
      };
    });
  };

  const renderResourceItem = ({ item }: { item: ResourceType }) => (
    <View style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <FontAwesome
          name={resourceTypes.find(t => t.id === item.type)?.icon || 'info'}
          size={20}
          color="#007AFF"
        />
        <Text style={styles.resourceName}>{item.name}</Text>
      </View>
      <Text style={styles.resourceAddress}>{item.address}</Text>
      <View style={styles.resourceDetails}>
        <Text style={styles.resourceDistance}>
          {item.distance ? `${item.distance.toFixed(1)} km` : 'Distance unknown'}
        </Text>
        <Text style={styles.resourceHours}>{item.hours}</Text>
      </View>
      <View style={styles.resourceTags}>
        {item.wheelchair_accessible && (
          <View style={styles.tag}>
            <FontAwesome name="wheelchair" size={12} color="#4CAF50" />
            <Text style={styles.tagText}>Wheelchair</Text>
          </View>
        )}
        {item.pet_friendly && (
          <View style={styles.tag}>
            <FontAwesome name="paw" size={12} color="#FF9800" />
            <Text style={styles.tagText}>Pet-friendly</Text>
          </View>
        )}
        {item.open_now && (
          <View style={[styles.tag, styles.openTag]}>
            <FontAwesome name="clock-o" size={12} color="#2196F3" />
            <Text style={[styles.tagText, styles.openTagText]}>Open now</Text>
          </View>
        )}
      </View>
      <View style={styles.resourceActions}>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="phone" size={16} color="#007AFF" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="map-marker" size={16} color="#007AFF" />
          <Text style={styles.actionText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filters</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filters.wheelchair && styles.filterChipActive
            ]}
            onPress={() => toggleFilter('wheelchair')}
          >
            <FontAwesome name="wheelchair" size={14} color={filters.wheelchair ? '#fff' : '#4CAF50'} />
            <Text style={[
              styles.filterChipText,
              filters.wheelchair && styles.filterChipTextActive
            ]}>Wheelchair</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filters.petFriendly && styles.filterChipActive
            ]}
            onPress={() => toggleFilter('petFriendly')}
          >
            <FontAwesome name="paw" size={14} color={filters.petFriendly ? '#fff' : '#FF9800'} />
            <Text style={[
              styles.filterChipText,
              filters.petFriendly && styles.filterChipTextActive
            ]}>Pet-friendly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filters.openNow && styles.filterChipActive
            ]}
            onPress={() => toggleFilter('openNow')}
          >
            <FontAwesome name="clock-o" size={14} color={filters.openNow ? '#fff' : '#2196F3'} />
            <Text style={[
              styles.filterChipText,
              filters.openNow && styles.filterChipTextActive
            ]}>Open now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.typeFiltersContainer}>
          {resourceTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeFilterChip,
                filters.selectedTypes.includes(type.id) && styles.typeFilterChipActive
              ]}
              onPress={() => toggleTypeFilter(type.id)}
            >
              <FontAwesome
                name={type.icon}
                size={14}
                color={filters.selectedTypes.includes(type.id) ? '#fff' : '#007AFF'}
              />
              <Text style={[
                styles.typeFilterChipText,
                filters.selectedTypes.includes(type.id) && styles.typeFilterChipTextActive
              ]}>{type.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            viewMode === 'list' && styles.viewToggleButtonActive
          ]}
          onPress={() => setViewMode('list')}
        >
          <FontAwesome name="list" size={16} color={viewMode === 'list' ? '#fff' : '#007AFF'} />
          <Text style={[
            styles.viewToggleText,
            viewMode === 'list' && styles.viewToggleTextActive
          ]}>List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            viewMode === 'map' && styles.viewToggleButtonActive
          ]}
          onPress={() => setViewMode('map')}
        >
          <FontAwesome name="map" size={16} color={viewMode === 'map' ? '#fff' : '#007AFF'} />
          <Text style={[
            styles.viewToggleText,
            viewMode === 'map' && styles.viewToggleTextActive
          ]}>Map</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={filteredResources}
          renderItem={renderResourceItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome name="search" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No resources found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters or search</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.mapContainer}>
          {location && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={true}
            >
              {filteredResources.map(resource => (
                <Marker
                  key={resource.id}
                  coordinate={{
                    latitude: resource.latitude,
                    longitude: resource.longitude,
                  }}
                  title={resource.name}
                  description={`${resource.distance?.toFixed(1)} km away`}
                />
              ))}
            </MapView>
          )}
        </View>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#333',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  typeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  typeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f2ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  typeFilterChipActive: {
    backgroundColor: '#007AFF',
  },
  typeFilterChipText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#007AFF',
  },
  typeFilterChipTextActive: {
    color: '#fff',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  viewToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  viewToggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  viewToggleText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
  },
  viewToggleTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  resourceAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resourceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resourceDistance: {
    fontSize: 14,
    color: '#007AFF',
  },
  resourceHours: {
    fontSize: 14,
    color: '#666',
  },
  resourceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  openTag: {
    backgroundColor: '#e6f2ff',
  },
  tagText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#333',
  },
  openTagText: {
    color: '#2196F3',
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
  },
  mapContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});
