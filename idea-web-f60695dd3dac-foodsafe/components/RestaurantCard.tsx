import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Restaurant } from '@/types';
import { SafetyScoreBadge } from './SafetyScoreBadge';

interface RestaurantCardProps {
  restaurant: Restaurant;
  showDistance?: boolean;
  onPress?: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  showDistance = true,
  onPress,
}) => {
  const distance = showDistance
    ? calculateDistance(restaurant.latitude, restaurant.longitude)
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <SafetyScoreBadge score={restaurant.safetyScore} />
      </View>

      <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
      <Text style={styles.address} numberOfLines={1}>{restaurant.address}</Text>

      {distance && (
        <Text style={styles.distance}>
          {distance.toFixed(1)} miles away
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.inspectionDate}>
          Last inspected: {formatDate(restaurant.lastInspectionDate)}
        </Text>
        {restaurant.violationCount > 0 && (
          <Text style={styles.violationCount}>
            {restaurant.violationCount} violation{restaurant.violationCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Helper function to calculate distance (simplified)
const calculateDistance = (lat: number, lng: number): number => {
  // In a real app, you would use a proper distance calculation
  // This is a simplified version for demonstration
  const userLat = 37.7749; // Default to San Francisco
  const userLng = -122.4194;

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat - userLat);
  const dLng = deg2rad(lng - userLng);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(userLat)) * Math.cos(deg2rad(lat)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km

  return distance * 0.621371; // Convert to miles
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  cuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  distance: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inspectionDate: {
    fontSize: 12,
    color: '#666',
  },
  violationCount: {
    fontSize: 12,
    color: '#FF5252',
    fontWeight: '500',
  },
});
