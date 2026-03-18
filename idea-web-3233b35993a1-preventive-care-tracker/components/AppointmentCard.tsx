import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Appointment } from '../types';
import { useStore } from '../store/useStore';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
}

export default function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const updateAppointment = useStore((state) => state.updateAppointment);
  const appointmentDate = new Date(appointment.date);
  const isUpcoming = appointmentDate > new Date();
  
  const handleToggleComplete = (e: any) => {
    e.stopPropagation();
    updateAppointment(appointment.id, { completed: !appointment.completed });
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        !isUpcoming && styles.pastCard,
        appointment.completed && styles.completedCard
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={handleToggleComplete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[
              styles.checkboxInner,
              appointment.completed && styles.checkboxChecked
            ]}>
              {appointment.completed && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
          <Text style={[
            styles.title,
            appointment.completed && styles.completedText
          ]}>
            {appointment.title}
          </Text>
        </View>
        <View style={[styles.badge, !isUpcoming && styles.pastBadge]}>
          <Text style={styles.badgeText}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <Text style={[
          styles.provider,
          appointment.completed && styles.completedText
        ]}>
          {appointment.provider}
        </Text>
        <Text style={[
          styles.date,
          appointment.completed && styles.completedText
        ]}>
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
  completedCard: {
    backgroundColor: '#F1F8F4',
    borderLeftColor: '#2E7D32',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
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
    marginLeft: 40,
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
