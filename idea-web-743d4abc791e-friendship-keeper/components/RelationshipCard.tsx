import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
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
    if (relationship.phoneNumber) {
      Linking.openURL(`tel:${relationship.phoneNumber}`).catch(() => {
        Alert.alert('Error', 'Unable to make the call');
      });
    } else {
      Alert.alert('No Phone Number', 'This relationship doesn\'t have a phone number saved');
    }
  };

  const handleText = () => {
    if (relationship.phoneNumber) {
      Linking.openURL(`sms:${relationship.phoneNumber}`).catch(() => {
        Alert.alert('Error', 'Unable to open messaging app');
      });
    } else {
      Alert.alert('No Phone Number', 'This relationship doesn\'t have a phone number saved');
    }
  };

  const handleSchedule = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        if (calendars.length > 0) {
          const now = new Date();
          const startDate = new Date(now.getTime() + 86400000); // Tomorrow
          const endDate = new Date(startDate.getTime() + 3600000); // 1 hour later

          const eventDetails = {
            title: `Catch up with ${relationship.name}`,
            startDate,
            endDate,
            timeZone: 'local',
            location: 'To be determined',
            notes: `Scheduled through Kinkeeper app\n\nRelationship: ${relationship.name}\nCategory: ${relationship.category}\nLast contact: ${formatDaysSince()}`,
          };

          await Calendar.createEventAsync(calendars[0].id, eventDetails);
          Alert.alert('Success', 'Event added to your calendar!');
        } else {
          Alert.alert('Error', 'No calendars available on your device');
        }
      } else {
        Alert.alert('Permission Required', 'Calendar permission is needed to schedule events');
      }
    } catch (error) {
      console.error('Error scheduling event:', error);
      Alert.alert('Error', 'Failed to schedule event. Please try again.');
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

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <MaterialIcons name="phone" size={16} color="#666" />
          <Text style={styles.detailText}>
            {relationship.phoneNumber || 'No phone number'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="event" size={16} color="#666" />
          <Text style={styles.detailText}>
            Next check-in: {relationship.frequency}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="history" size={16} color="#666" />
          <Text style={styles.detailText}>
            Last contact: {formatDaysSince()}
          </Text>
        </View>
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
          <MaterialIcons name="calendar-today" size={24} color="#9C27B0" />
          <Text style={styles.actionText}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  healthScore: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    flex: 1,
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
});
