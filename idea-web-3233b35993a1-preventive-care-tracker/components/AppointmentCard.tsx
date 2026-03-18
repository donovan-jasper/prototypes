import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Appointment } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
}

export default function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.date);
  const isUpcoming = appointmentDate > new Date();
  
  return (
    <TouchableOpacity 
      style={[styles.card, !isUpcoming && styles.pastCard]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{appointment.title}</Text>
        <View style={[styles.badge, !isUpcoming && styles.pastBadge]}>
          <Text style={styles.badgeText}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.provider}>{appointment.provider}</Text>
        <Text style={styles.date}>
          {format(appointmentDate, 'MMM d, yyyy')} at {format(appointmentDate, 'h:mm a')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  pastCard: {
    borderLeftColor: '#9E9E9E',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pastBadge: {
    backgroundColor: '#F5F5F5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
  },
  details: {
    gap: 4,
  },
  provider: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
});
