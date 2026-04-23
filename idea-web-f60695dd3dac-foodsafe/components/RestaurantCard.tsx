import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Restaurant } from '@/types';
import { SafetyScoreBadge } from './SafetyScoreBadge';
import { Colors } from '@/constants/Colors';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  isPremium: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onPress, isPremium }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {restaurant.address}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <SafetyScoreBadge
            score={restaurant.safetyScore}
            lastInspectionDate={restaurant.lastInspectionDate}
            violationCount={restaurant.violationCount}
          />
        </View>
      </View>

      {!isPremium && restaurant.violationCount > 0 && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>Pro</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
