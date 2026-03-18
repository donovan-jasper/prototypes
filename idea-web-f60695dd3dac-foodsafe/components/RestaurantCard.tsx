import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Restaurant } from '@/types';
import { Colors } from '@/constants/Colors';
import SafetyScoreBadge from './SafetyScoreBadge';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

export default function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
          <Text style={styles.address} numberOfLines={1}>
            {restaurant.address}
          </Text>
        </View>
        <SafetyScoreBadge
          score={restaurant.safetyScore}
          lastInspectionDate={restaurant.lastInspectionDate}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.violations}>
          {restaurant.violationCount} {restaurant.violationCount === 1 ? 'violation' : 'violations'}
        </Text>
        <Text style={styles.tapHint}>Tap for details →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  violations: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tapHint: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});
