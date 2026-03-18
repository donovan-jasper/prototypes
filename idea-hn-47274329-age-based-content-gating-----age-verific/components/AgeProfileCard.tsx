import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AgeProfileCardProps {
  name: string;
  age: number;
  profileType: 'toddler' | 'kid' | 'teen' | 'adult';
  onPress?: () => void;
}

const PROFILE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  toddler: 'happy',
  kid: 'school',
  teen: 'game-controller',
  adult: 'person',
};

const PROFILE_COLORS: Record<string, string> = {
  toddler: '#FF9500',
  kid: '#34C759',
  teen: '#5856D6',
  adult: '#007AFF',
};

export function AgeProfileCard({ name, age, profileType, onPress }: AgeProfileCardProps) {
  const iconName = PROFILE_ICONS[profileType];
  const color = PROFILE_COLORS[profileType];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`profile-card-${profileType}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons
          name={iconName}
          size={32}
          color={color}
          testID={`${profileType}-icon`}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.age}>{age} years old</Text>
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color }]}>
            {profileType.charAt(0).toUpperCase() + profileType.slice(1)}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  age: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F2F2F7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
