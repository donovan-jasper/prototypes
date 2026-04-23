import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, differenceInDays } from 'date-fns';

interface PreventiveCareCardProps {
  screening: {
    type: string;
    name: string;
    description: string;
    frequency: string;
    importance: string;
    icon: string;
  };
  nextDueDate: Date;
  daysUntil?: number;
  onMarkComplete?: () => void;
  onSetReminder?: () => void;
  isCompleted?: boolean;
  showReminderButton?: boolean;
}

const PreventiveCareCard: React.FC<PreventiveCareCardProps> = ({
  screening,
  nextDueDate,
  daysUntil,
  onMarkComplete,
  onSetReminder,
  isCompleted = false,
  showReminderButton = false,
}) => {
  const days = daysUntil !== undefined ? daysUntil : differenceInDays(nextDueDate, new Date());
  const isOverdue = days < 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{screening.name}</Text>
        {isCompleted && (
          <Text style={styles.completedBadge}>Completed</Text>
        )}
      </View>

      <Text style={styles.description}>{screening.description}</Text>

      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Frequency:</Text>
        <Text style={styles.detailValue}>{screening.frequency}</Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Next Due:</Text>
        <Text style={styles.detailValue}>{format(nextDueDate, 'MMM d, yyyy')}</Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Days Until:</Text>
        <Text style={[styles.detailValue, isOverdue ? styles.overdue : null]}>
          {isOverdue ? 'Overdue!' : days}
        </Text>
      </View>

      <View style={styles.actions}>
        {onMarkComplete && (
          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={onMarkComplete}
          >
            <Text style={styles.buttonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}

        {(onSetReminder || showReminderButton) && (
          <TouchableOpacity
            style={[styles.button, styles.reminderButton]}
            onPress={onSetReminder}
          >
            <Text style={styles.buttonText}>Remind Me</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  },
  completedBadge: {
    backgroundColor: '#2ECC71',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A89DC',
  },
  overdue: {
    color: '#E74C3C',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#2ECC71',
  },
  reminderButton: {
    backgroundColor: '#4A89DC',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PreventiveCareCard;
