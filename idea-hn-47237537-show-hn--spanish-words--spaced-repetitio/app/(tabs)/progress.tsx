import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import { getTotalWordsLearned, getWordsByDifficulty } from '../../lib/database';

export default function ProgressScreen() {
  const [totalLearned, setTotalLearned] = useState(0);
  const [difficultyStats, setDifficultyStats] = useState({
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const learned = await getTotalWordsLearned();
      setTotalLearned(learned);

      const beginner = await getWordsByDifficulty('beginner');
      const intermediate = await getWordsByDifficulty('intermediate');
      const advanced = await getWordsByDifficulty('advanced');

      setDifficultyStats({
        beginner: beginner.length,
        intermediate: intermediate.length,
        advanced: advanced.length,
      });
    };

    fetchStats();
  }, []);

  const comprehensionPercentage = Math.min(100, Math.floor(totalLearned / 10));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <ProgressBar progress={totalLearned} />
        <Text style={styles.comprehensionText}>
          You understand {comprehensionPercentage}% of everyday Spanish
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mastery Breakdown</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.beginner]}>{difficultyStats.beginner}</Text>
            <Text style={styles.statLabel}>Beginner</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.intermediate]}>{difficultyStats.intermediate}</Text>
            <Text style={styles.statLabel}>Intermediate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.advanced]}>{difficultyStats.advanced}</Text>
            <Text style={styles.statLabel}>Advanced</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Review</Text>
        {/* Add weekly review component here */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1E40AF',
  },
  comprehensionText: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 10,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  beginner: {
    color: '#EF4444',
  },
  intermediate: {
    color: '#F59E0B',
  },
  advanced: {
    color: '#10B981',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
});
