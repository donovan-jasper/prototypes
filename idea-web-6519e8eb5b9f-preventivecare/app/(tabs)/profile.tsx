import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store/appStore';
import PreventiveCareCard from '../../components/PreventiveCareCard';
import { schedulePreventiveCareReminder } from '../../lib/notifications';
import { PREVENTIVE_CARE_RECOMMENDATIONS } from '../../constants/PreventiveCare';
import { getTimelineEvents, addTimelineEvent } from '../../lib/timeline';
import { format, differenceInDays, isAfter } from 'date-fns';

const ProfileScreen = () => {
  const user = useAppStore(state => state.user);
  const [recommendedScreenings, setRecommendedScreenings] = useState<any[]>([]);
  const [completedScreenings, setCompletedScreenings] = useState<any[]>([]);
  const [upcomingScreenings, setUpcomingScreenings] = useState<any[]>([]);

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

      // Calculate upcoming screenings
      const today = new Date();
      const upcoming = recommendations?.screenings.map(screening => {
        const lastCompleted = getLastCompletedDate(screening.type);
        const nextDueDate = calculateNextDueDate(screening.frequency, lastCompleted);
        const daysUntil = differenceInDays(nextDueDate, today);

        return {
          ...screening,
          nextDueDate,
          daysUntil,
          isOverdue: daysUntil < 0
        };
      }).filter(item => item.daysUntil >= -30) || [];

      setUpcomingScreenings(upcoming);
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
    } else if (frequency === 'every 10 years') {
      nextDate.setFullYear(today.getFullYear() + 10);
    }

    // If there's a last completed date, use that to calculate next due date
    if (lastCompleted) {
      if (frequency === 'annual') {
        nextDate.setFullYear(lastCompleted.getFullYear() + 1);
      } else if (frequency === 'biennial') {
        nextDate.setFullYear(lastCompleted.getFullYear() + 2);
      } else if (frequency === 'every 10 years') {
        nextDate.setFullYear(lastCompleted.getFullYear() + 10);
      }
    }

    return nextDate;
  };

  const handleMarkComplete = async (screeningType: string) => {
    try {
      await addTimelineEvent({
        type: 'preventive_care',
        title: `${screeningType} Screening`,
        date: new Date(),
        notes: `Completed ${screeningType} screening`,
        completed: true,
        userId: user.id
      });

      Alert.alert('Success', 'Screening marked as completed');
      loadScreenings(); // Refresh the screenings
    } catch (error) {
      console.error('Error marking screening as complete:', error);
      Alert.alert('Error', 'Failed to mark screening as complete');
    }
  };

  const handleSetReminder = async (screeningType: string, date: Date) => {
    try {
      await schedulePreventiveCareReminder(screeningType, date, user.id);
      Alert.alert('Success', `Reminder set for ${format(date, 'MMMM d, yyyy')}`);
    } catch (error) {
      console.error('Error setting reminder:', error);
      Alert.alert('Error', 'Failed to set reminder');
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
            const daysUntil = differenceInDays(nextDueDate, new Date());

            return (
              <PreventiveCareCard
                key={index}
                screening={screening}
                nextDueDate={nextDueDate}
                daysUntil={daysUntil}
                onMarkComplete={() => handleMarkComplete(screening.type)}
                onSetReminder={() => handleSetReminder(screening.type, nextDueDate)}
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
        <Text style={styles.sectionTitle}>Upcoming Screenings</Text>
        {upcomingScreenings.length > 0 ? (
          upcomingScreenings.map((screening, index) => (
            <View key={index} style={styles.upcomingItem}>
              <Text style={styles.upcomingTitle}>{screening.name}</Text>
              <Text style={styles.upcomingDate}>
                Due: {format(screening.nextDueDate, 'MMM d, yyyy')}
              </Text>
              <Text style={[
                styles.upcomingDays,
                screening.isOverdue ? styles.overdue : null
              ]}>
                {screening.isOverdue ? 'Overdue' : `${screening.daysUntil} days`}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyState}>
            No upcoming screenings in the next 30 days.
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
                Completed: {format(new Date(event.date), 'MMM d, yyyy')}
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyState: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  upcomingItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A89DC',
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  upcomingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  upcomingDays: {
    fontSize: 14,
    color: '#4A89DC',
    fontWeight: '600',
  },
  overdue: {
    color: '#E74C3C',
  },
  completedItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2ECC71',
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileScreen;
