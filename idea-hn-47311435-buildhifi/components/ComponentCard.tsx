import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Card, Badge } from 'react-native-paper';
import { Component } from '@/lib/types';

interface ComponentCardProps {
  component: Component;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
  const getCompatibilityColor = () => {
    // This would be connected to the validation system
    return '#4caf50'; // Default to green
  };

  return (
    <Card style={styles.card}>
      <Card.Cover
        source={{ uri: component.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <Card.Content style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{component.name}</Text>
        <Text style={styles.brand} numberOfLines={1}>{component.brand}</Text>
        <View style={styles.specsContainer}>
          {component.specs.impedance && (
            <Badge style={[styles.specBadge, { backgroundColor: getCompatibilityColor() }]}>
              {component.specs.impedance}Ω
            </Badge>
          )}
          {component.specs.powerWatts && (
            <Badge style={[styles.specBadge, { backgroundColor: getCompatibilityColor() }]}>
              {component.specs.powerWatts}W
            </Badge>
          )}
          {component.specs.outputs && (
            <Badge style={[styles.specBadge, { backgroundColor: getCompatibilityColor() }]}>
              {component.specs.outputs.join(', ')}
            </Badge>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    elevation: 2,
  },
  image: {
    height: 100,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    padding: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  brand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  specBadge: {
    marginRight: 4,
    marginBottom: 4,
  },
});

export default ComponentCard;
