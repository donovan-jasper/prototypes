import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Space } from '../lib/types';

interface SpaceCardProps {
  space: Space;
  onPress: () => void;
}

export default function SpaceCard({ space, onPress }: SpaceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{space.name}</Text>
        <Text style={styles.memberCount}>{space.members.length} members</Text>
      </View>
      <Text style={styles.createdAt}>
        Created: {new Date(space.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  createdAt: {
    fontSize: 12,
    color: '#888',
  },
});
