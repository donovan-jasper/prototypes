import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { Platform } from '../types';

interface PlatformBadgeProps {
  platform: Platform;
  size?: 'small' | 'medium';
}

const platformColors: Record<Platform, string> = {
  ebay: '#E53238',
  etsy: '#F1641E',
  depop: '#FF0000',
  poshmark: '#630F3E',
  facebook: '#1877F2',
};

const platformLabels: Record<Platform, string> = {
  ebay: 'eBay',
  etsy: 'Etsy',
  depop: 'Depop',
  poshmark: 'Poshmark',
  facebook: 'Facebook',
};

export default function PlatformBadge({ platform, size = 'small' }: PlatformBadgeProps) {
  return (
    <Chip
      mode="flat"
      compact={size === 'small'}
      style={[
        styles.badge,
        { backgroundColor: platformColors[platform] },
        size === 'small' && styles.smallBadge,
      ]}
      textStyle={[styles.badgeText, size === 'small' && styles.smallBadgeText]}
    >
      {platformLabels[platform]}
    </Chip>
  );
}

const styles = StyleSheet.create({
  badge: {
    marginRight: 4,
    marginBottom: 4,
  },
  smallBadge: {
    height: 24,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  smallBadgeText: {
    fontSize: 10,
  },
});
