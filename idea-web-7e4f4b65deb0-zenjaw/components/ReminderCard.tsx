import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Reminder } from '@/types';
import { Colors } from '@/constants/colors';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: number, enabled: boolean) => void;
  onDelete: (id: number) => void;
}

export default function ReminderCard({ reminder, onToggle, onDelete }: ReminderCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatBodyZone = (zone: string) => {
    return zone.charAt(0).toUpperCase() + zone.slice(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.time}>{formatTime(reminder.time)}</Text>
          <Text style={styles.bodyZone}>{formatBodyZone(reminder.bodyZone)}</Text>
        </View>
        <View style={styles.actions}>
          <Switch
            value={reminder.enabled}
            onValueChange={(value) => onToggle(reminder.id, value)}
            trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
            thumbColor="#fff"
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(reminder.id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  info: {
    flex: 1,
  },
  time: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  bodyZone: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.tense,
    borderRadius: 6,
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
