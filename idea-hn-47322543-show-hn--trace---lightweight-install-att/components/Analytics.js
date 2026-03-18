import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { getInstallCount, getDeepLinkCount, getInstallsBySource, getRecentInstalls } from '../services/AnalyticsService';

const Analytics = () => {
  const [installCount, setInstallCount] = useState(0);
  const [deepLinkCount, setDeepLinkCount] = useState(0);
  const [installsBySource, setInstallsBySource] = useState([]);
  const [recentInstalls, setRecentInstalls] = useState([]);
  const [trendData, setTrendData] = useState({ today: 0, yesterday: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const installs = await getInstallCount();
      const deepLinks = await getDeepLinkCount();
      const sourceData = await getInstallsBySource();
      const recent = await getRecentInstalls();
      
      setInstallCount(installs);
      setDeepLinkCount(deepLinks);
      setInstallsBySource(sourceData);
      setRecentInstalls(recent);
      
      // Calculate trend data
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
      
      const todayCount = recent.filter(install => install.timestamp >= oneDayAgo).length;
      const yesterdayCount = recent.filter(install => 
        install.timestamp >= twoDaysAgo && install.timestamp < oneDayAgo
      ).length;
      
      setTrendData({ today: todayCount, yesterday: yesterdayCount });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

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
                  <Text style={styles.sourceCount}>{item.count}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.percentage}>{percentage}%</Text>
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
            <View key={index} style={styles.recentCard}>
              <View style={styles.recentDot} />
              <View style={styles.recentContent}>
                <Text style={styles.recentSource}>{install.source}</Text>
                <Text style={styles.recentTime}>{formatTimestamp(install.timestamp)}</Text>
              </View>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
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
    fontWeight: '600',
    color: '#333',
  },
  trendIndicator: {
    marginTop: 12,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  trendIndicatorText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sourceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sourceCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  percentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  recentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentSource: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  recentTime: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});

export default Analytics;
