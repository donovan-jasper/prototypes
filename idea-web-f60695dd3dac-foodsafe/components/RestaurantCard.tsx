import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Restaurant } from '@/types';
import SafetyScoreBadge from './SafetyScoreBadge';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  showDistance?: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  showDistance = false,
  userLocation,
}) => {
  // Calculate distance if user location is provided
  const calculateDistance = () => {
    if (!userLocation || !restaurant.latitude || !restaurant.longitude) return null;

    const R = 6371; // Radius of the Earth in km
    const dLat = (restaurant.latitude - userLocation.latitude) * Math.PI / 180;
    const dLon = (restaurant.longitude - userLocation.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.latitude * Math.PI / 180) *
      Math.cos(restaurant.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const distance = showDistance ? calculateDistance() : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        {distance && (
          <Text style={styles.distance}>
            {distance}
          </Text>
        )}
      </View>

      <Text style={styles.cuisine} numberOfLines={1}>
        {restaurant.cuisine}
      </Text>

      <Text style={styles.address} numberOfLines={2}>
        {restaurant.address}
      </Text>

      <SafetyScoreBadge restaurant={restaurant} size="small" />

      {restaurant.isPremium && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  cuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default RestaurantCard;
