import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Restaurant } from '@/types';
import SafetyScoreBadge from './SafetyScoreBadge';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
        <Text style={styles.address} numberOfLines={1}>{restaurant.address}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <SafetyScoreBadge
          score={restaurant.safetyScore}
          lastInspectionDate={restaurant.lastInspectionDate}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: '#888',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
});

export default RestaurantCard;
