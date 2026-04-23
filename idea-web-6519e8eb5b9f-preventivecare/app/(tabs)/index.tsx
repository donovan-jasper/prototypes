import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAppStore } from '../../store/appStore';
import HabitCard from '../../components/HabitCard';
import HealthScore from '../../components/HealthScore';
import PreventiveCareCard from '../../components/PreventiveCareCard';
import { PREVENTIVE_CARE_RECOMMENDATIONS } from '../../constants/PreventiveCare';
import { getDatabase } from '../../lib/database';

const TodayScreen = () => {
  const { habits, user, loadHabits } = useAppStore();
  const [preventiveCareItems, setPreventiveCareItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await loadHabits();
      if (user) {
        await loadPreventiveCareItems();
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
    const itemsWithDates = recommendations.screenings.map(screening => {
      // Check if there's a scheduled notification for this screening
      const nextDueDate = new Date(today);
      if (screening.frequency === 'annual') {
        nextDueDate.setFullYear(today.getFullYear() + 1);
      } else if (screening.frequency === 'biennial') {
        nextDueDate.setFullYear(today.getFullYear() + 2);
      }

      return {
        ...screening,
        nextDueDate,
      };
    });

    setPreventiveCareItems(itemsWithDates);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A89DC" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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

      {preventiveCareItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preventive Care Reminders</Text>
          {preventiveCareItems.map((item, index) => (
            <PreventiveCareCard
              key={index}
              screening={item}
              nextDueDate={item.nextDueDate}
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
    marginBottom: 16,
    color: '#333',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default TodayScreen;
