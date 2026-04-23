import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface TimelineEventProps {
  event: {
    id: number;
    type: string;
    title: string;
    date: Date;
    notes?: string;
    attachments?: string[];
    completed?: boolean;
  };
  onPress: () => void;
}

const getEventIcon = (type: string) => {
  switch (type) {
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
    case 'preventive_care':
      return 'shield';
    default:
      return 'document-text';
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'doctor_visit':
      return '#4CAF50';
    case 'symptom':
      return '#FF5252';
    case 'medication':
      return '#2196F3';
    case 'lab_result':
      return '#9C27B0';
    case 'vaccine':
      return '#FFC107';
    case 'preventive_care':
      return '#673AB7';
    default:
      return '#607D8B';
  }
};

const TimelineEvent: React.FC<TimelineEventProps> = ({ event, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.timeline}>
        <View style={[styles.timelineDot, { backgroundColor: getEventColor(event.type) }]} />
        <View style={styles.timelineLine} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons
            name={getEventIcon(event.type)}
            size={20}
            color={getEventColor(event.type)}
            style={styles.icon}
          />
          <Text style={styles.title}>{event.title}</Text>
          {event.completed && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#4CAF50"
              style={styles.completedIcon}
            />
          )}
        </View>

        <Text style={styles.time}>
          {format(new Date(event.date), 'h:mm a')}
        </Text>

        {event.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {event.notes}
          </Text>
        )}

        {event.attachments && event.attachments.length > 0 && (
          <View style={styles.attachments}>
            <Ionicons name="attach" size={16} color="#666" />
            <Text style={styles.attachmentCount}>
              {event.attachments.length} attachment{event.attachments.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeline: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E0E0E0',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  completedIcon: {
    marginLeft: 4,
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  attachments: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  attachmentCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default TimelineEvent;
