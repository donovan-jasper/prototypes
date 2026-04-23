import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store/appStore';
import PreventiveCareCard from '../../components/PreventiveCareCard';
import { scheduleAllPreventiveCareReminders, cancelReminder } from '../../lib/notifications';
import { PREVENTIVE_CARE_RECOMMENDATIONS } from '../../constants/PreventiveCare';
import { getTimelineEvents, markScreeningAsCompleted } from '../../lib/timeline';
import { format, isAfter } from 'date-fns';

const ProfileScreen = () => {
  const user = useAppStore(state => state.user);
  const [recommendedScreenings, setRecommendedScreenings] = useState<any[]>([]);
  const [completedScreenings, setCompletedScreenings] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadScreenings();
    }
  }, [user]);

  const loadScreenings = async () => {
    try {
      // Get recommended screenings based on age and gender
      const recommendations = PREVENTIVE_CARE_RECOMMENDATIONS.find(
        rec => user.age >= rec.ageRange[0] && user.age <= rec.ageRange[1] && rec.gender === user.gender
      );

      if (recommendations) {
        setRecommendedScreenings(recommendations.screenings);
      }

      // Get completed screenings from timeline
      const completed = await getTimelineEvents(
        new Date(new Date().getFullYear(), 0, 1), // Start of current year
        undefined,
        user.id
      );

      const preventiveCareEvents = completed.filter(
        event => event.type === 'preventive_care' && event.completed
      );

      setCompletedScreenings(preventiveCareEvents);

      // Schedule all preventive care reminders
      await scheduleAllPreventiveCareReminders(user.id);
    } catch (error) {
      console.error('Error loading screenings:', error);
      Alert.alert('Error', 'Failed to load screenings');
    }
  };

  const calculateNextDueDate = (frequency: string, lastCompleted?: Date) => {
    const today = new Date();
    const nextDate = new Date(today);

    if (frequency === 'annual') {
      nextDate.setFullYear(today.getFullYear() + 1);
    } else if (frequency === 'biennial') {
      nextDate.setFullYear(today.getFullYear() + 2);
    }

    // If there's a last completed date, use that to calculate next due date
    if (lastCompleted) {
      if (frequency === 'annual') {
        nextDate.setFullYear(lastCompleted.getFullYear() + 1);
      } else if (frequency === 'biennial') {
        nextDate.setFullYear(lastCompleted.getFullYear() + 2);
      }
    }

    return nextDate;
  };

  const handleMarkComplete = async (screeningType: string) => {
    try {
      await markScreeningAsCompleted(screeningType, user.id);
      Alert.alert('Success', 'Screening marked as completed');
      loadScreenings(); // Refresh the screenings
    } catch (error) {
      console.error('Error marking screening as complete:', error);
      Alert.alert('Error', 'Failed to mark screening as complete');
    }
  };

  const isScreeningCompleted = (screeningType: string) => {
    return completedScreenings.some(event => {
      const eventType = event.title.replace(' Screening', '').toLowerCase();
      return eventType === screeningType.toLowerCase() &&
             isAfter(new Date(), new Date(event.date));
    });
  };

  const getLastCompletedDate = (screeningType: string) => {
    const matchingEvents = completedScreenings.filter(event => {
      const eventType = event.title.replace(' Screening', '').toLowerCase();
      return eventType === screeningType.toLowerCase();
    });

    if (matchingEvents.length > 0) {
      // Return the most recent completion date
      return new Date(Math.max(...matchingEvents.map(e => new Date(e.date).getTime())));
    }
    return undefined;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Screenings</Text>
        {recommendedScreenings.length > 0 ? (
          recommendedScreenings.map((screening, index) => {
            const lastCompleted = getLastCompletedDate(screening.type);
            const nextDueDate = calculateNextDueDate(screening.frequency, lastCompleted);
            const isCompleted = isScreeningCompleted(screening.type);

            return (
              <PreventiveCareCard
                key={index}
                screening={screening}
                nextDueDate={nextDueDate}
                onMarkComplete={() => handleMarkComplete(screening.type)}
                isCompleted={isCompleted}
              />
            );
          })
        ) : (
          <Text style={styles.emptyState}>
            No recommended screenings found for your age and gender.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed Screenings</Text>
        {completedScreenings.length > 0 ? (
          completedScreenings.map((event, index) => (
            <View key={index} style={styles.completedItem}>
              <Text style={styles.completedTitle}>{event.title}</Text>
              <Text style={styles.completedDate}>
                Completed on {format(new Date(event.date), 'MMM d, yyyy')}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyState}>
            No completed screenings yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  emptyState: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  completedItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  completedDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default ProfileScreen;
