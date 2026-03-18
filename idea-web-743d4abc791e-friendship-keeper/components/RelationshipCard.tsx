import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RelationshipWithHealth } from '../types';
import { useRouter } from 'expo-router';

interface RelationshipCardProps {
  relationship: RelationshipWithHealth;
}

export const RelationshipCard: React.FC<RelationshipCardProps> = ({ relationship }) => {
  const router = useRouter();

  const getHealthColor = () => {
    switch (relationship.health.status) {
      case 'healthy':
        return '#4CAF50';
      case 'at-risk':
        return '#FF9800';
      case 'neglected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getCategoryColor = () => {
    switch (relationship.category) {
      case 'Family':
        return '#E91E63';
      case 'Friends':
        return '#2196F3';
      case 'Professional':
        return '#9C27B0';
      case 'Acquaintance':
        return '#607D8B';
      default:
        return '#9E9E9E';
    }
  };

  const formatDaysSince = () => {
    const days = relationship.health.daysSinceContact;
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/relationship/${relationship.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{relationship.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
            <Text style={styles.categoryText}>{relationship.category}</Text>
          </View>
        </View>
        <View style={[styles.healthIndicator, { backgroundColor: getHealthColor() }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.lastContact}>{formatDaysSince()}</Text>
        <Text style={styles.frequency}>Check-in: {relationship.frequency}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  healthIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastContact: {
    fontSize: 14,
    color: '#757575',
  },
  frequency: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});
