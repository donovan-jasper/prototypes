import { getResourcesByLocation } from './database';
import { calculateDistance } from './location';

export const fetchNearbyResources = async (
  latitude: number,
  longitude: number,
  maxDistance: number = 10
) => {
  try {
    const resources = await getResourcesByLocation(latitude, longitude, maxDistance);

    // Calculate distance for each resource
    const resourcesWithDistance = resources.map(resource => ({
      ...resource,
      distance: calculateDistance(
        latitude,
        longitude,
        resource.latitude,
        resource.longitude
      )
    }));

    return resourcesWithDistance;
  } catch (error) {
    console.error('Error fetching nearby resources:', error);
    throw error;
  }
};

export const filterResources = (
  resources: any[],
  filters: {
    searchQuery?: string;
    wheelchair?: boolean;
    petFriendly?: boolean;
    openNow?: boolean;
    selectedTypes?: string[];
  }
) => {
  let filtered = [...resources];

  // Search filter
  if (filters.searchQuery) {
    filtered = filtered.filter(resource =>
      resource.name.toLowerCase().includes(filters.searchQuery!.toLowerCase()) ||
      resource.type.toLowerCase().includes(filters.searchQuery!.toLowerCase())
    );
  }

  // Type filters
  if (filters.selectedTypes && filters.selectedTypes.length > 0) {
    filtered = filtered.filter(resource =>
      filters.selectedTypes!.includes(resource.type)
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

  return filtered;
};

export const cacheResourcesOffline = async (resources: any[]) => {
  // In a real app, we would implement proper offline caching logic here
  // For now, we'll just log the action
  console.log(`Caching ${resources.length} resources for offline use`);
  // This would typically involve storing the resources in SQLite
  // and setting up a sync mechanism when online
};
