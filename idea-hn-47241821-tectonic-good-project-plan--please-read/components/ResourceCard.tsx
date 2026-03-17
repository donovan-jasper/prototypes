import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type ResourceCardProps = {
  name: string;
  type: string;
  address: string;
  distance: number;
  hours: string;
  wheelchairAccessible: boolean;
  petFriendly: boolean;
  openNow: boolean;
  onCall: () => void;
  onDirections: () => void;
};

const ResourceCard: React.FC<ResourceCardProps> = ({
  name,
  type,
  address,
  distance,
  hours,
  wheelchairAccessible,
  petFriendly,
  openNow,
  onCall,
  onDirections,
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'shelter':
        return 'home';
      case 'food':
        return 'cutlery';
      case 'legal':
        return 'gavel';
      case 'health':
        return 'medkit';
      default:
        return 'info';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <FontAwesome name={getTypeIcon()} size={20} color="#007AFF" />
        <Text style={styles.name}>{name}</Text>
      </View>
      <Text style={styles.address}>{address}</Text>
      <View style={styles.details}>
        <Text style={styles.distance}>{distance.toFixed(1)} km</Text>
        <Text style={styles.hours}>{hours}</Text>
      </View>
      <View style={styles.tags}>
        {wheelchairAccessible && (
          <View style={styles.tag}>
            <FontAwesome name="wheelchair" size={12} color="#4CAF50" />
            <Text style={styles.tagText}>Wheelchair</Text>
          </View>
        )}
        {petFriendly && (
          <View style={styles.tag}>
            <FontAwesome name="paw" size={12} color="#FF9800" />
            <Text style={styles.tagText}>Pet-friendly</Text>
          </View>
        )}
        {openNow && (
          <View style={[styles.tag, styles.openTag]}>
            <FontAwesome name="clock-o" size={12} color="#2196F3" />
            <Text style={[styles.tagText, styles.openTagText]}>Open now</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onCall}>
          <FontAwesome name="phone" size={16} color="#007AFF" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDirections}>
          <FontAwesome name="map-marker" size={16} color="#007AFF" />
          <Text style={styles.actionText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  distance: {
    fontSize: 14,
    color: '#007AFF',
  },
  hours: {
    fontSize: 14,
    color: '#666',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  openTag: {
    backgroundColor: '#e6f2ff',
  },
  tagText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#333',
  },
  openTagText: {
    color: '#2196F3',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
  },
});

export default ResourceCard;
