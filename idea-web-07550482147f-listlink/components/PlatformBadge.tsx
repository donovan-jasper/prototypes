import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlatformBadgeProps {
  platform: string;
}

const platformColors: Record<string, string> = {
  ebay: '#e53238',
  poshmark: '#000000',
  mercari: '#000000',
  depop: '#000000',
  default: '#666666',
};

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const color = platformColors[platform.toLowerCase()] || platformColors.default;

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
