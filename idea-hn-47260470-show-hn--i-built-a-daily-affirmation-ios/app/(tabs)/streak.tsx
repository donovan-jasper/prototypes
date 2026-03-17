import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StreakCalendar from '../../components/StreakCalendar';
import { getStreakData, getCurrentStreak } from '../../lib/database';
import { useStore } from '../../store/useStore';

const StreakScreen = () => {
  const [streakData, setStreakData] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const updateStreak = useStore((state) => state.updateStreak);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getStreakData();
      setStreakData(data);

      const streak = await getCurrentStreak();
      setCurrentStreak(streak);
    };

    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Streak</Text>
      <Text style={styles.streakCount}>Current Streak: {currentStreak} days</Text>
      <Text style={styles.graceDaysInfo}>Grace Days Used: {streakData.filter(day => day.is_grace_day).length}/2 this week</Text>
      <StreakCalendar streakData={streakData} />
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
});

export default StreakScreen;
