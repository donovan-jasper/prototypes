import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimelineEvent = ({ event }) => {
  const getIcon = () => {
    switch (event.type) {
      case 'doctor_visit':
        return 'medkit';
      case 'symptom':
        return 'alert-circle';
      case 'medication':
        return 'pill';
      case 'lab_result':
        return 'flask';
      case 'vaccine':
        return 'shield-checkmark';
      default:
        return 'calendar';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon()} size={24} color="#673ab7" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>{new Date(event.date).toLocaleDateString()}</Text>
        {event.notes && <Text style={styles.notes}>{event.notes}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#444',
  },
});

export default TimelineEvent;
