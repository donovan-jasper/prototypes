import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StreakCalendar from '../../components/StreakCalendar';
import { getStreakData, getCurrentStreak } from '../../lib/database';
import { useStore } from '../../store/useStore';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const StreakScreen = () => {
  const [streakData, setStreakData] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [graceDaysUsed, setGraceDaysUsed] = useState(0);
  const updateStreak = useStore((state) => state.updateStreak);

  useEffect(() => {
    const fetchData = async () => {
      await updateStreak();
      const data = await getStreakData();
      setStreakData(data);

      const streak = await getCurrentStreak();
      setCurrentStreak(streak);

      // Calculate grace days used this week
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      const graceDays = data.filter(day =>
        day.is_grace_day &&
        new Date(day.date) >= weekStart &&
        new Date(day.date) <= weekEnd
      ).length;

      setGraceDaysUsed(graceDays);
    };

    fetchData();
  }, [updateStreak]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Streak</Text>
      <Text style={styles.streakCount}>Current Streak: {currentStreak} days</Text>
      <Text style={styles.graceDaysInfo}>Grace Days Used: {graceDaysUsed}/2 this week</Text>
      <StreakCalendar streakData={streakData} />
      <View style={styles.milestones}>
        <Text style={styles.milestoneTitle}>Milestones</Text>
        <View style={styles.milestoneList}>
          <Text style={styles.milestoneItem}>🎉 7 days</Text>
          <Text style={styles.milestoneItem}>🎉 30 days</Text>
          <Text style={styles.milestoneItem}>🎉 100 days</Text>
          <Text style={styles.milestoneItem}>🎉 365 days</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  streakCount: {
    fontSize: 18,
    marginBottom: 10,
    color: '#666',
  },
  graceDaysInfo: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  milestones: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  milestoneList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  milestoneItem: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default StreakScreen;
