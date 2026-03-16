import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HabitCard = ({ habit, onToggle }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onToggle}>
      <View style={styles.iconContainer}>
        <Ionicons name={habit.icon} size={24} color="#673ab7" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{habit.name}</Text>
        <Text style={styles.streak}>Streak: {habit.streak} days</Text>
      </View>
      <View style={styles.statusContainer}>
        {habit.completedToday ? (
          <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color="#9e9e9e" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  streak: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    marginLeft: 16,
  },
});

export default HabitCard;
