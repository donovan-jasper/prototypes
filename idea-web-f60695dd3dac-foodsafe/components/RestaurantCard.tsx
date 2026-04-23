import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Restaurant } from '@/types';
import { Colors } from '@/constants/Colors';
import { SafetyScoreBadge } from './SafetyScoreBadge';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  isPremium: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onPress, isPremium }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <SafetyScoreBadge score={restaurant.safetyScore} />
      </View>

      <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
      <Text style={styles.address} numberOfLines={1}>{restaurant.address}</Text>

      <View style={styles.footer}>
        <Text style={styles.inspectionDate}>
          Last inspected: {new Date(restaurant.lastInspectionDate).toLocaleDateString()}
        </Text>
        {restaurant.violationCount > 0 && (
          <Text style={styles.violationCount}>
            {restaurant.violationCount} {restaurant.violationCount === 1 ? 'violation' : 'violations'}
          </Text>
        )}
      </View>

      {!isPremium && restaurant.violationCount > 0 && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>Premium: Full violation details</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  cuisine: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inspectionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  violationCount: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
  },
  premiumBadge: {
    backgroundColor: Colors.primaryLight,
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  premiumBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
  },
});
