import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAppStore } from '../../store/appStore';
import HabitCard from '../../components/HabitCard';
import HealthScore from '../../components/HealthScore';
import PreventiveCareCard from '../../components/PreventiveCareCard';
import { PREVENTIVE_CARE_RECOMMENDATIONS } from '../../constants/PreventiveCare';
import { getDatabase } from '../../lib/database';
import { scheduleAllPreventiveCareReminders } from '../../lib/notifications';
import { differenceInDays, format } from 'date-fns';

const TodayScreen = () => {
  const { habits, user, loadHabits } = useAppStore();
  const [preventiveCareItems, setPreventiveCareItems] = useState<any[]>([]);
  const [nextScreening, setNextScreening] = useState<any>(null);
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

    // Find the screening with the soonest due date
    const sortedItems = [...itemsWithDates].sort((a, b) => a.daysUntil - b.daysUntil);
    setNextScreening(sortedItems[0] || null);

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

      {nextScreening && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Screening</Text>
          <View style={styles.nextScreeningCard}>
            <Text style={styles.nextScreeningTitle}>{nextScreening.name}</Text>
            <Text style={styles.nextScreeningDate}>
              Due: {format(nextScreening.nextDueDate, 'MMMM d, yyyy')}
            </Text>
            <Text style={[
              styles.nextScreeningDays,
              nextScreening.isOverdue ? styles.overdue : null
            ]}>
              {nextScreening.isOverdue
                ? 'Overdue!'
                : `${nextScreening.daysUntil} days remaining`}
            </Text>
          </View>
        </View>
      )}

      {preventiveCareItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preventive Care Reminders</Text>
          {preventiveCareItems.map((item, index) => (
            <PreventiveCareCard
              key={index}
              screening={item}
              nextDueDate={item.nextDueDate}
              daysUntil={item.daysUntil}
              showReminderButton={true}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  nextScreeningCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextScreeningTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  nextScreeningDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  nextScreeningDays: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A89DC',
  },
  overdue: {
    color: '#E74C3C',
  },
});

export default TodayScreen;
