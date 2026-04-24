import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Card, Badge } from 'react-native-paper';
import { Component } from '@/lib/types';

interface ComponentCardProps {
  component: Component;
  validationStatus: 'compatible' | 'warning' | 'incompatible';
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, validationStatus }) => {
  const getStatusColor = () => {
    switch (validationStatus) {
      case 'compatible':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'incompatible':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'compatible':
        return 'check-circle';
      case 'warning':
        return 'alert-circle';
      case 'incompatible':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.imageContainer}>
          {component.imageUrl ? (
            <Image
              source={{ uri: component.imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{component.type.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <Text style={styles.name} numberOfLines={1}>{component.name}</Text>
        <Text style={styles.brand} numberOfLines={1}>{component.brand}</Text>

        <View style={styles.specsContainer}>
          {component.specs.impedance && (
            <Badge style={[styles.specBadge, { backgroundColor: '#2196f3' }]}>
              {component.specs.impedance}Ω
            </Badge>
          )}
          {component.specs.powerWatts && (
            <Badge style={[styles.specBadge, { backgroundColor: '#9c27b0' }]}>
              {component.specs.powerWatts}W
            </Badge>
          )}
          {component.specs.outputs && (
            <Badge style={[styles.specBadge, { backgroundColor: '#ff5722' }]}>
              {component.specs.outputs.join(', ')}
            </Badge>
          )}
        </View>

        <Badge
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
          icon={getStatusIcon()}
        >
          {validationStatus.charAt(0).toUpperCase() + validationStatus.slice(1)}
        </Badge>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 180,
    borderRadius: 8,
    elevation: 2,
  },
  content: {
    padding: 8,
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eeeeee',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#9e9e9e',
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  brand: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },
  specBadge: {
    margin: 2,
    fontSize: 10,
  },
  statusBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 10,
  },
});

export default ComponentCard;
