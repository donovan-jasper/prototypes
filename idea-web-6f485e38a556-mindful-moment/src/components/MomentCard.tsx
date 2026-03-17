import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Moment } from '../types';

interface MomentCardProps {
  moment: Moment;
  onPress: () => void;
}

export const MomentCard: React.FC<MomentCardProps> = ({ moment, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.categoryContainer}>
        <Text style={styles.category}>{moment.category}</Text>
      </View>
      <Text style={styles.title}>{moment.title}</Text>
      <Text style={styles.duration}>{moment.duration} seconds</Text>
      <Text style={styles.description}>{moment.description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryContainer: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  category: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#444',
  },
});
