import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAppStore } from '../store/appStore';
import { markScreeningAsCompleted } from '../lib/timeline';
import { schedulePreventiveCareReminder } from '../lib/notifications';

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
}

const PreventiveCareCard: React.FC<PreventiveCareCardProps> = ({ screening, nextDueDate }) => {
  const { user } = useAppStore();
  const daysUntilDue = Math.ceil((nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handleMarkComplete = async () => {
    if (!user) return;

    // Mark as completed in timeline
    await markScreeningAsCompleted(screening.type, user.id);

    // Calculate next due date based on frequency
    const today = new Date();
    let nextDate = new Date(today);

    if (screening.frequency === 'annual') {
      nextDate.setFullYear(today.getFullYear() + 1);
    } else if (screening.frequency === 'biennial') {
      nextDate.setFullYear(today.getFullYear() + 2);
    } else if (screening.frequency === 'every 10 years') {
      nextDate.setFullYear(today.getFullYear() + 10);
    }

    // Schedule new reminder
    await schedulePreventiveCareReminder(screening.type, nextDate, user.id);
  };

  const getStatusColor = () => {
    if (daysUntilDue <= 0) return '#FF6B6B'; // Overdue
    if (daysUntilDue <= 30) return '#FFD166'; // Due soon
    return '#4ECDC4'; // On track
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name={screening.icon}
          size={24}
          color={getStatusColor()}
          style={styles.icon}
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>{screening.name}</Text>
          <Text style={styles.description}>{screening.description}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Frequency:</Text>
          <Text style={styles.detailValue}>{screening.frequency}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Next Due:</Text>
          <Text style={styles.detailValue}>
            {format(nextDueDate, 'MMM d, yyyy')}
            {daysUntilDue > 0 ? ` (in ${daysUntilDue} days)` : ' (overdue)'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Importance:</Text>
          <Text style={styles.detailValue}>{screening.importance}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: getStatusColor() }]}
        onPress={handleMarkComplete}
      >
        <Text style={styles.buttonText}>Mark as Completed</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  details: {
    marginBottom: 16,
  },
  detailItem: {
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
    color: '#333',
    fontWeight: '500',
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PreventiveCareCard;
