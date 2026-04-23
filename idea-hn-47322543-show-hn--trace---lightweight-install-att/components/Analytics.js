import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { getInstallCount, getDeepLinkCount, getInstallsBySource, getRecentInstalls, getInstallTrendData } from '../services/AnalyticsService';

const Analytics = () => {
  const [installCount, setInstallCount] = useState(0);
  const [deepLinkCount, setDeepLinkCount] = useState(0);
  const [installsBySource, setInstallsBySource] = useState([]);
  const [recentInstalls, setRecentInstalls] = useState([]);
  const [trendData, setTrendData] = useState({ today: 0, yesterday: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [installs, deepLinks, sourceData, recent, trend] = await Promise.all([
        getInstallCount(),
        getDeepLinkCount(),
        getInstallsBySource(),
        getRecentInstalls(),
        getInstallTrendData()
      ]);

      setInstallCount(installs);
      setDeepLinkCount(deepLinks);
      setInstallsBySource(sourceData);
      setRecentInstalls(recent);
      setTrendData(trend);
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

  const trend = getTrendIndicator();

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
                  <Text style={styles.sourceName}>{item.source || 'Unknown'}</Text>
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
        <Text style={styles.sectionTitle}>Recent Installs</Text>
        {recentInstalls.length === 0 ? (
          <Text style={styles.emptyText}>No recent installs</Text>
        ) : (
          recentInstalls.map((install, index) => (
            <View key={index} style={styles.recentInstallCard}>
              <Text style={styles.recentInstallSource}>{install.source || 'Unknown'}</Text>
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
    color: '#333',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
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
    marginBottom: 4,
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
    color: '#333',
    marginBottom: 12,
  },
  trendCard: {
    backgroundColor: 'white',
    borderRadius: 8,
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
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  trendIndicatorText: {
    color: 'white',
    fontWeight: '600',
  },
  sourceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
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
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  recentInstallCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentInstallSource: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  recentInstallTime: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
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
    textDecorationLine: 'underline',
  },
});

export default Analytics;
