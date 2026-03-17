import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { sessionManager, Session } from '@/lib/session/sessionManager';
import { InsightsEngine } from '@/lib/analytics/insightsEngine';
import { initDatabase } from '@/lib/database/schema';

export default function AnalyticsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completionRate, setCompletionRate] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [hourlyData, setHourlyData] = useState<{ [hour: number]: number }>({});

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      await initDatabase();
      const allSessions = await sessionManager.getAllSessions();
      const completedSessions = await sessionManager.getCompletedSessions();
      
      setSessions(allSessions);

      const engine = new InsightsEngine();
      
      // Calculate completion rate
      const rate = engine.calculateCompletionRate(allSessions);
      setCompletionRate(rate);

      // Generate insights
      const generatedInsights = engine.generateInsights(completedSessions);
      setInsights(generatedInsights);

      // Calculate hourly energy data
      const hourData: { [hour: number]: { total: number; count: number } } = {};
      completedSessions.forEach((session) => {
        if (!session.energyRating || !session.startTime) return;
        const hour = new Date(session.startTime).getHours();
        if (!hourData[hour]) {
          hourData[hour] = { total: 0, count: 0 };
        }
        hourData[hour].total += session.energyRating;
        hourData[hour].count += 1;
      });

      const averages: { [hour: number]: number } = {};
      Object.entries(hourData).forEach(([hour, data]) => {
        averages[parseInt(hour)] = data.total / data.count;
      });
      setHourlyData(averages);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  const completedSessions = sessions.filter((s) => s.status === 'completed');

  if (completedSessions.length < 3) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
          />
        }
      >
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No data yet</Text>
        <Text style={styles.emptyText}>
          Complete at least 3 sessions to see your analytics and insights
        </Text>
        {completedSessions.length > 0 && (
          <Text style={styles.progressText}>
            {completedSessions.length} / 3 sessions completed
          </Text>
        )}
      </ScrollView>
    );
  }

  const maxRating = Math.max(...Object.values(hourlyData), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#667eea"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>
          {completedSessions.length} completed sessions
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completion Rate</Text>
        <View style={styles.completionCard}>
          <Text style={styles.completionPercentage}>
            {Math.round(completionRate * 100)}%
          </Text>
          <Text style={styles.completionLabel}>
            {sessions.filter((s) => s.status === 'completed').length} of{' '}
            {sessions.length} sessions completed
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Energy by Hour of Day</Text>
        <View style={styles.chartCard}>
          {Object.keys(hourlyData).length === 0 ? (
            <Text style={styles.noDataText}>
              Not enough data to show hourly patterns
            </Text>
          ) : (
            <View style={styles.chart}>
              {Object.entries(hourlyData)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([hour, rating]) => {
                  const hourNum = parseInt(hour);
                  const hour12 = hourNum % 12 || 12;
                  const period = hourNum >= 12 ? 'PM' : 'AM';
                  const barHeight = (rating / maxRating) * 120;

                  return (
                    <View key={hour} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        <View
                          style={[styles.bar, { height: barHeight }]}
                        />
                      </View>
                      <Text style={styles.barLabel}>
                        {hour12}
                        {period}
                      </Text>
                      <Text style={styles.barValue}>
                        {rating.toFixed(1)}⭐
                      </Text>
                    </View>
                  );
                })}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <Text style={styles.insightIcon}>💡</Text>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  completionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  completionPercentage: {
    fontSize: 48,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 8,
  },
  completionLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 32,
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#1a1a1a',
    fontWeight: '600',
    marginTop: 2,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
