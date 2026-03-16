import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StreakCalendar from '../../components/StreakCalendar';
import { getStreakData } from '../../lib/database';

const StreakScreen = () => {
  const [streakData, setStreakData] = useState([]);

  useEffect(() => {
    const fetchStreakData = async () => {
      const data = await getStreakData();
      setStreakData(data);
    };

    fetchStreakData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Streak</Text>
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
});

export default StreakScreen;
