import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AchievementBadge from '../../components/AchievementBadge';
import PremiumGate from '../../components/PremiumGate';
import { getUserStats } from '../../lib/database';
import { UserStats } from '../../lib/types';

export default function Profile() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const userStats = await getUserStats();
      setStats(userStats);
    };
    loadStats();
  }, []);

  if (!stats) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.streak}>Current Streak: {stats.streak} days</Text>
      </View>
      <View style={styles.achievements}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {stats.achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </View>
      <PremiumGate />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#673ab7',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  streak: {
    fontSize: 18,
    color: '#fff',
  },
  achievements: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
