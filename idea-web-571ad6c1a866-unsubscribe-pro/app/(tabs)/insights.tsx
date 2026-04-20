import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useHealthScore } from '../../hooks/useHealthScore';
import HealthScore from '../../components/HealthScore';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const InsightsScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { healthScore, weeklyStats, streakCount, timeSaved } = useHealthScore();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Data is already loaded via the hook
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading your insights...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inbox Health Score</Text>
        <HealthScore score={healthScore} />
        <Text style={styles.scoreDescription}>
          {healthScore >= 80 ? 'Excellent! Your inbox is clean and organized.' :
           healthScore >= 60 ? 'Good job! Keep up the cleanup habits.' :
           healthScore >= 40 ? 'You can do better! Try unsubscribing from more senders.' :
           'Your inbox needs attention. Start unsubscribing today!'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <LineChart
          data={{
            labels: weeklyStats.map(stat => stat.date),
            datasets: [
              {
                data: weeklyStats.map(stat => stat.score),
              },
            ],
          }}
          width={Dimensions.get('window').width - 32}
          height={220}
          yAxisSuffix="%"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#2196F3',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="access-time" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{timeSaved.toFixed(1)} hours</Text>
          <Text style={styles.statLabel}>Time Saved</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="whatshot" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{streakCount}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="email" size={24} color="#F44336" />
          <Text style={styles.statValue}>{weeklyStats[weeklyStats.length - 1]?.unsubscribed || 0}</Text>
          <Text style={styles.statLabel}>Unsubscribed</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tips for Improvement</Text>
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb-outline" size={20} color="#FFC107" />
          <Text style={styles.tipText}>Set up auto-unsubscribe rules for common senders</Text>
        </View>
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb-outline" size={20} color="#FFC107" />
          <Text style={styles.tipText}>Check your email spending tracker for unused subscriptions</Text>
        </View>
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb-outline" size={20} color="#FFC107" />
          <Text style={styles.tipText}>Enable the widget to quickly unsubscribe from your home screen</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
});

export default InsightsScreen;
