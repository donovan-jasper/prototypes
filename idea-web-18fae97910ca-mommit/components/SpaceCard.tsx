import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Space } from '../lib/types';
import { useRouter } from 'expo-router';

interface SpaceCardProps {
  space: Space;
}

const SpaceCard: React.FC<SpaceCardProps> = ({ space }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/space/${space.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{space.name}</Text>
        <Text style={styles.memberCount}>{space.members.length} members</Text>
      </View>
      <Text style={styles.lastUpdated}>
        Last updated: {new Date(space.updated_at || space.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  memberCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default SpaceCard;
