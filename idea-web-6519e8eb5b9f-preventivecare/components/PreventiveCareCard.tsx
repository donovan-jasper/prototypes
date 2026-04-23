import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface PreventiveCareCardProps {
  screening: {
    name: string;
    type: string;
    nextDueDate: Date;
    daysUntil: number;
    isOverdue: boolean;
  };
  onSnooze: (type: string) => void;
  onDismiss: (type: string) => void;
}

const PreventiveCareCard: React.FC<PreventiveCareCardProps> = ({ screening, onSnooze, onDismiss }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name={screening.isOverdue ? "alert-circle" : "calendar"}
          size={24}
          color={screening.isOverdue ? "#E74C3C" : "#4A89DC"}
        />
        <Text style={styles.title}>{screening.name}</Text>
      </View>

      <Text style={styles.date}>
        {screening.isOverdue
          ? `Overdue by ${Math.abs(screening.daysUntil)} days`
          : `Due in ${screening.daysUntil} days (${format(screening.nextDueDate, 'MMM d, yyyy')})`}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.snoozeButton]}
          onPress={() => onSnooze(screening.type)}
        >
          <Ionicons name="alarm" size={16} color="#34495E" />
          <Text style={styles.actionButtonText}>Snooze</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dismissButton]}
          onPress={() => onDismiss(screening.type)}
        >
          <Ionicons name="checkmark" size={16} color="#27AE60" />
          <Text style={styles.actionButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
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
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginLeft: 10,
  },
  date: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  snoozeButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  dismissButton: {
    backgroundColor: '#E8F8F5',
    borderWidth: 1,
    borderColor: '#A3E4D7',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default PreventiveCareCard;
