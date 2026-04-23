import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface PreventiveCareCardProps {
  screening: {
    type: string;
    name: string;
    description: string;
    frequency: string;
    icon: string;
    color: string;
  };
  nextDueDate: Date;
  onMarkComplete?: () => void;
  isCompleted?: boolean;
}

const PreventiveCareCard: React.FC<PreventiveCareCardProps> = ({
  screening,
  nextDueDate,
  onMarkComplete,
  isCompleted = false
}) => {
  return (
    <View style={[styles.card, isCompleted && styles.completedCard]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: screening.color }]}>
          <Ionicons name={screening.icon} size={24} color="white" />
        </View>
        <View style={styles.textContainer}>
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
          <Text style={styles.detailValue}>{format(nextDueDate, 'MMM d, yyyy')}</Text>
        </View>
      </View>

      {onMarkComplete && (
        <TouchableOpacity
          style={[styles.button, isCompleted && styles.completedButton]}
          onPress={onMarkComplete}
        >
          <Text style={styles.buttonText}>
            {isCompleted ? 'Completed' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>
      )}
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
  completedCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default PreventiveCareCard;
