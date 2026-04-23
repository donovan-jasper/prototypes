import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { RelationshipWithHealth } from '../types';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';

interface RelationshipCardProps {
  relationship: RelationshipWithHealth;
}

export const RelationshipCard: React.FC<RelationshipCardProps> = ({ relationship }) => {
  const router = useRouter();

  const getHealthColor = () => {
    switch (relationship.health.status) {
      case 'healthy':
        return '#4CAF50';
      case 'at-risk':
        return '#FF9800';
      case 'neglected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getCategoryColor = () => {
    switch (relationship.category) {
      case 'Family':
        return '#E91E63';
      case 'Friends':
        return '#2196F3';
      case 'Professional':
        return '#9C27B0';
      case 'Acquaintance':
        return '#607D8B';
      default:
        return '#9E9E9E';
    }
  };

  const formatDaysSince = () => {
    const days = relationship.health.daysSinceContact;
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const handleCall = () => {
    // In a real app, you would get the phone number from the relationship data
    const phoneNumber = '1234567890'; // Replace with actual phone number
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleText = () => {
    // In a real app, you would get the phone number from the relationship data
    const phoneNumber = '1234567890'; // Replace with actual phone number
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleSchedule = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        if (calendars.length > 0) {
          const eventDetails = {
            title: `Catch up with ${relationship.name}`,
            startDate: new Date(Date.now() + 86400000), // Tomorrow
            endDate: new Date(Date.now() + 90000000), // Tomorrow + 1 hour
            timeZone: 'local',
            location: 'To be determined',
            notes: `Scheduled through Kinkeeper app`,
          };

          await Calendar.createEventAsync(calendars[0].id, eventDetails);
          alert('Event added to your calendar!');
        }
      } else {
        alert('Calendar permission is required to schedule events');
      }
    } catch (error) {
      console.error('Error scheduling event:', error);
      alert('Failed to schedule event');
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/relationship/${relationship.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{relationship.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
            <Text style={styles.categoryText}>{relationship.category}</Text>
          </View>
        </View>
        <View style={styles.healthContainer}>
          <View style={[styles.healthIndicator, { backgroundColor: getHealthColor() }]} />
          <Text style={[styles.healthScore, { color: getHealthColor() }]}>
            Health: {Math.round(relationship.health.score)}%
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.lastContact}>{formatDaysSince()}</Text>
        <Text style={styles.frequency}>Check-in: {relationship.frequency}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <MaterialIcons name="phone" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleText}>
          <MaterialIcons name="message" size={24} color="#2196F3" />
          <Text style={styles.actionText}>Text</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSchedule}>
          <MaterialIcons name="event" size={24} color="#9C27B0" />
          <Text style={styles.actionText}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  healthContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  healthScore: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lastContact: {
    fontSize: 14,
    color: '#757575',
  },
  frequency: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
});
