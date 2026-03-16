import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ActivityProfile } from '../types';

interface ActivityProfileCardProps {
  profile: ActivityProfile;
  isSelected: boolean;
  onSelect: (profileId: string) => void;
  onEdit: (profileId: string) => void;
}

export const ActivityProfileCard: React.FC<ActivityProfileCardProps> = ({
  profile,
  isSelected,
  onSelect,
  onEdit,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected ? styles.selected : null]}
      onPress={() => onSelect(profile.id)}
      onLongPress={() => onEdit(profile.id)}
    >
      <View style={styles.iconContainer}>
        {/* Replace with actual icon component */}
        <Text style={styles.icon}>{profile.icon}</Text>
      </View>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.sensitivity}>Sensitivity: {profile.sensitivity}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    margin: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sensitivity: {
    fontSize: 12,
    color: '#666',
  },
});
