import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store/appStore';
import HabitCard from '../../components/HabitCard';
import HealthScore from '../../components/HealthScore';
import { PREVENTIVE_CARE_RECOMMENDATIONS } from '../../constants/PreventiveCare';
import { getDatabase } from '../../lib/database';
import { scheduleAllPreventiveCareReminders } from '../../lib/notifications';
import { differenceInDays, format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const TodayScreen = () => {
  const { habits, user, loadHabits } = useAppStore();
  const [preventiveCareItems, setPreventiveCareItems] = useState<any[]>([]);
  const [nextScreenings, setNextScreenings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await loadHabits();
      if (user) {
        await loadPreventiveCareItems();
        await scheduleAllPreventiveCareReminders(user.id);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const loadPreventiveCareItems = async () => {
    if (!user) return;

    const db = await getDatabase();
    const today = new Date();

    // Get user's age and gender
    const userData = await db.getFirstAsync(
      'SELECT age, gender FROM users WHERE id = ?',
      [user.id]
    );

    if (!userData) return;

    // Find matching recommendations
    const recommendations = PREVENTIVE_CARE_RECOMMENDATIONS.find(
      rec => userData.age >= rec.ageRange[0] && userData.age <= rec.ageRange[1] && rec.gender === userData.gender
    );

    if (!recommendations) return;

    // Calculate next due dates for each screening
    const itemsWithDates = await Promise.all(recommendations.screenings.map(async (screening) => {
      // Check if there's a completed entry for this screening type
      const lastCompleted = await db.getFirstAsync(
        'SELECT date FROM timeline_events WHERE type = ? AND user_id = ? AND completed = 1 ORDER BY date DESC LIMIT 1',
        ['preventive_care', user.id]
      );

      let nextDueDate: Date;

      if (lastCompleted) {
        // Calculate next date based on last completed date
        const lastDate = new Date(lastCompleted.date);
        nextDueDate = new Date(lastDate);

        if (screening.frequency === 'annual') {
          nextDueDate.setFullYear(lastDate.getFullYear() + 1);
        } else if (screening.frequency === 'biennial') {
          nextDueDate.setFullYear(lastDate.getFullYear() + 2);
        } else if (screening.frequency === 'every 10 years') {
          nextDueDate.setFullYear(lastDate.getFullYear() + 10);
        }
      } else {
        // First time - calculate based on current date
        nextDueDate = new Date(today);
        if (screening.frequency === 'annual') {
          nextDueDate.setFullYear(today.getFullYear() + 1);
        } else if (screening.frequency === 'biennial') {
          nextDueDate.setFullYear(today.getFullYear() + 2);
        } else if (screening.frequency === 'every 10 years') {
          nextDueDate.setFullYear(today.getFullYear() + 10);
        }
      }

      const daysUntil = differenceInDays(nextDueDate, today);

      return {
        ...screening,
        nextDueDate,
        daysUntil,
        isOverdue: daysUntil < 0
      };
    }));

    // Sort by soonest due date and take top 3
    const sortedItems = [...itemsWithDates].sort((a, b) => a.daysUntil - b.daysUntil);
    setNextScreenings(sortedItems.slice(0, 3));
    setPreventiveCareItems(itemsWithDates);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits();
    if (user) {
      await loadPreventiveCareItems();
    }
    setRefreshing(false);
  };

  const handleSnooze = async (screeningType: string) => {
    const db = await getDatabase();
    const today = new Date();

    // Find the screening in our list
    const screening = nextScreenings.find(s => s.type === screeningType);
    if (!screening) return;

    // Calculate new date (7 days from now)
    const newDate = new Date(today);
    newDate.setDate(today.getDate() + 7);

    // Update the notification
    await scheduleAllPreventiveCareReminders(user.id);

    // Refresh the data
    await loadPreventiveCareItems();
  };

  const handleDismiss = async (screeningType: string) => {
    const db = await getDatabase();

    // Mark as completed in timeline
    await db.runAsync(
      'INSERT INTO timeline_events (user_id, type, title, date, completed) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'preventive_care', screeningType, new Date().toISOString(), 1]
    );

    // Refresh the data
    await loadPreventiveCareItems();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A89DC" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4A89DC"
        />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        {habits.length > 0 ? (
          habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))
        ) : (
          <Text style={styles.emptyText}>No habits added yet. Add some in the Profile tab!</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Health Score</Text>
        <HealthScore />
      </View>

      {nextScreenings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Screenings</Text>
          {nextScreenings.map((screening, index) => (
            <View key={index} style={styles.screeningCard}>
              <View style={styles.screeningHeader}>
                <Ionicons
                  name={screening.isOverdue ? "alert-circle" : "calendar"}
                  size={24}
                  color={screening.isOverdue ? "#E74C3C" : "#4A89DC"}
                />
                <Text style={styles.screeningTitle}>{screening.name}</Text>
              </View>

              <Text style={styles.screeningDate}>
                {screening.isOverdue
                  ? `Overdue by ${Math.abs(screening.daysUntil)} days`
                  : `Due in ${screening.daysUntil} days (${format(screening.nextDueDate, 'MMM d, yyyy')})`}
              </Text>

              <View style={styles.screeningActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.snoozeButton]}
                  onPress={() => handleSnooze(screening.type)}
                >
                  <Ionicons name="alarm" size={16} color="#34495E" />
                  <Text style={styles.actionButtonText}>Snooze</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.dismissButton]}
                  onPress={() => handleDismiss(screening.type)}
                >
                  <Ionicons name="checkmark" size={16} color="#27AE60" />
                  <Text style={styles.actionButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  emptyText: {
    color: '#7F8C8D',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  screeningCard: {
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
  screeningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  screeningTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginLeft: 10,
  },
  screeningDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 10,
  },
  screeningActions: {
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

export default TodayScreen;
