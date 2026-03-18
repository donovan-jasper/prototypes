import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useHabits } from '../../hooks/useHabits';
import HealthScore from '../../components/HealthScore';
import InsightCard from '../../components/InsightCard';
import { calculateHealthScore, findCorrelations } from '../../lib/insights';

export default function InsightsScreen() {
  const { habits, loadHabits } = useHabits();
  const [healthScore, setHealthScore] = useState(0);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      const completedHabits = habits.filter(habit => habit.completedToday).length;
      setHealthScore(Math.round((completedHabits / habits.length) * 100));

      const newInsights = [];
      for (let i = 0; i < habits.length; i++) {
        for (let j = i + 1; j < habits.length; j++) {
          const habitALogs = habits[i].logs || [];
          const habitBLogs = habits[j].logs || [];

          const uniqueDaysA = new Set(habitALogs.map(log => new Date(log.date).toDateString())).size;
          const uniqueDaysB = new Set(habitBLogs.map(log => new Date(log.date).toDateString())).size;

          if (uniqueDaysA >= 7 && uniqueDaysB >= 7) {
            const correlation = findCorrelations(habitALogs, habitBLogs);
            if (Math.abs(correlation.strength) > 0.5) {
              newInsights.push({
                habitA: habits[i].name,
                habitB: habits[j].name,
                strength: correlation.strength,
                insight: correlation.insight,
              });
            }
          }
        }
      }
      setInsights(newInsights);
    }
  }, [habits]);

  const hasInsufficientData = habits.length > 0 && insights.length === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights</Text>
      <HealthScore score={healthScore} />
      <ScrollView style={styles.insightsContainer}>
        {hasInsufficientData ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Log habits for 7+ days to see patterns</Text>
          </View>
        ) : (
          insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightsContainer: {
    marginTop: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
