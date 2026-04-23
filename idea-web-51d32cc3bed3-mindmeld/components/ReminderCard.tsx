import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useReminders } from '../store/reminders';
import { Reminder } from '../types';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface ReminderCardProps {
  reminder: Reminder;
}

const categoryColors = {
  personal: '#4CAF50',
  work: '#2196F3',
  health: '#FF5722',
  finance: '#9C27B0',
  other: '#607D8B',
};

const recurrenceIcons = {
  daily: 'repeat',
  weekly: 'repeat',
  monthly: 'repeat',
  none: undefined,
};

export default function ReminderCard({ reminder }: ReminderCardProps) {
  const { toggleReminder } = useReminders();
  const date = new Date(reminder.date);

  return (
    <TouchableOpacity onPress={() => toggleReminder(reminder.id)}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColors[reminder.category || 'other'] }]} />
          <Text style={[styles.title, reminder.completed && styles.completed]}>
            {reminder.title}
          </Text>
          {reminder.recurrence && reminder.recurrence !== 'none' && (
            <MaterialIcons
              name={recurrenceIcons[reminder.recurrence]}
              size={16}
              color="#666"
              style={styles.recurrenceIcon}
            />
          )}
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={16} color="#666" />
            <Text style={styles.detailText}>{format(date, 'MMM d, h:mm a')}</Text>
          </View>

          {reminder.location && (
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.detailText}>{reminder.location}</Text>
            </View>
          )}

          {reminder.recurrence && reminder.recurrence !== 'none' && (
            <View style={styles.detailRow}>
              <MaterialIcons name="repeat" size={16} color="#666" />
              <Text style={styles.detailText}>
                {reminder.recurrence.charAt(0).toUpperCase() + reminder.recurrence.slice(1)}
                {reminder.recurrenceEnd && ` until ${format(new Date(reminder.recurrenceEnd), 'MMM d, yyyy')}`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.status}>
          <Text style={styles.categoryText}>
            {reminder.category?.charAt(0).toUpperCase() + reminder.category?.slice(1)}
          </Text>
          <MaterialIcons
            name={reminder.completed ? 'check-circle' : 'radio-button-unchecked'}
            size={20}
            color={reminder.completed ? '#4CAF50' : '#999'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  recurrenceIcon: {
    marginLeft: 5,
  },
  details: {
    marginLeft: 18,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  status: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
});
