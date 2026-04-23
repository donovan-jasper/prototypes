import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { getInstallCount, getDeepLinkCount, getInstallsBySource, getRecentInstalls, getInstallTrendData, getDeepLinkUsage, getInstallSourcesOverTime } from '../services/AnalyticsService';

const Analytics = () => {
  const [installCount, setInstallCount] = useState(0);
  const [deepLinkCount, setDeepLinkCount] = useState(0);
  const [installsBySource, setInstallsBySource] = useState([]);
  const [recentInstalls, setRecentInstalls] = useState([]);
  const [trendData, setTrendData] = useState({ today: 0, yesterday: 0 });
  const [deepLinkUsage, setDeepLinkUsage] = useState([]);
  const [installSourcesOverTime, setInstallSourcesOverTime] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [installs, deepLinks, sourceData, recent, trend, deepLinksUsage, sourcesOverTime] = await Promise.all([
        getInstallCount(),
        getDeepLinkCount(),
        getInstallsBySource(),
        getRecentInstalls(),
        getInstallTrendData(),
        getDeepLinkUsage(),
        getInstallSourcesOverTime()
      ]);

      setInstallCount(installs);
      setDeepLinkCount(deepLinks);
      setInstallsBySource(sourceData);
      setRecentInstalls(recent);
      setTrendData(trend);
      setDeepLinkUsage(deepLinksUsage);
      setInstallSourcesOverTime(sourcesOverTime);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  }, [fetchAnalytics]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTrendIndicator = () => {
    if (trendData.today > trendData.yesterday) {
      return { text: '↑ Up', color: '#34C759' };
    } else if (trendData.today < trendData.yesterday) {
      return { text: '↓ Down', color: '#FF3B30' };
    }
    return { text: '→ Stable', color: '#FF9500' };
  };

  const prepareChartData = () => {
    if (installSourcesOverTime.length === 0) return null;

    // Group by date and source
    const dates = [...new Set(installSourcesOverTime.map(item => item.date))].sort();
    const sources = [...new Set(installSourcesOverTime.map(item => item.source))];

    const datasets = sources.map(source => {
      return {
        data: dates.map(date => {
          const entry = installSourcesOverTime.find(item => item.date === date && item.source === source);
          return entry ? entry.count : 0;
        }),
        color: () => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`,
        strokeWidth: 2
      };
    });

    return {
      labels: dates,
      datasets,
      legend: sources
    };
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchAnalytics}>
          Tap to retry
        </Text>
      </View>
    );
  }

  const trend = getTrendIndicator();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Analytics</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Installs</Text>
          <Text style={styles.statValue}>{installCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Deep Links</Text>
          <Text style={styles.statValue}>{deepLinkCount}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trend</Text>
        <View style={styles.trendCard}>
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>Today:</Text>
            <Text style={styles.trendValue}>{trendData.today}</Text>
          </View>
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>Yesterday:</Text>
            <Text style={styles.trendValue}>{trendData.yesterday}</Text>
          </View>
          <View style={[styles.trendIndicator, { backgroundColor: trend.color }]}>
            <Text style={styles.trendIndicatorText}>{trend.text}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Installs by Source</Text>
        {installsBySource.length === 0 ? (
          <Text style={styles.emptyText}>No install data yet</Text>
        ) : (
          installsBySource.map((item, index) => {
            const percentage = installCount > 0
              ? ((item.count / installCount) * 100).toFixed(1)
              : 0;
            return (
              <View key={index} style={styles.sourceCard}>
                <View style={styles.sourceHeader}>
                  <Text style={styles.sourceName}>{item.source}</Text>
                  <Text style={styles.sourceCount}>{item.count} installs</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.percentageText}>{percentage}%</Text>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deep Link Usage</Text>
        {deepLinkUsage.length === 0 ? (
          <Text style={styles.emptyText}>No deep link data yet</Text>
        ) : (
          deepLinkUsage.map((item, index) => (
            <View key={index} style={styles.deepLinkCard}>
              <Text style={styles.deepLinkText}>{item.link}</Text>
              <Text style={styles.deepLinkCount}>{item.count} uses</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Install Trends Over Time</Text>
        {chartData ? (
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#ffffff'
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        ) : (
          <Text style={styles.emptyText}>Not enough data for trends</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Installs</Text>
        {recentInstalls.length === 0 ? (
          <Text style={styles.emptyText}>No recent installs</Text>
        ) : (
          recentInstalls.map((install, index) => (
            <View key={index} style={styles.recentInstallCard}>
              <Text style={styles.recentInstallSource}>{install.source}</Text>
              <Text style={styles.recentInstallTime}>{formatTimestamp(install.timestamp)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  trendCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 16,
    color: '#666',
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  trendIndicator: {
    borderRadius: 12,
    padding: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  trendIndicatorText: {
    color: 'white',
    fontWeight: '600',
  },
  sourceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sourceCount: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  deepLinkCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deepLinkText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  deepLinkCount: {
    fontSize: 12,
    color: '#666',
  },
  recentInstallCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentInstallSource: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  recentInstallTime: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
});

export default Analytics;
