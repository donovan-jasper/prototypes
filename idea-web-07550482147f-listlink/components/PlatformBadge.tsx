import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlatformBadgeProps {
  platform: string;
}

const platformColors: Record<string, string> = {
  ebay: '#3a6fe6',
  poshmark: '#ff69b4',
  mercari: '#ffc107',
  depop: '#000000',
  stockx: '#ff5722',
  whatnot: '#4caf50',
};

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const color = platformColors[platform.toLowerCase()] || '#666';

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{platform}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
