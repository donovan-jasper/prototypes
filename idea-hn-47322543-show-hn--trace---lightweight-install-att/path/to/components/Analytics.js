import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getInstallCount, getDeepLinkCount, getInstallTrendData, getInstallsBySource } from '../services/AnalyticsService';

const Analytics = () => {
  const [installCount, setInstallCount] = useState(0);
  const [deepLinkCount, setDeepLinkCount] = useState(0);
  const [trendData, setTrendData] = useState({ today: 0, yesterday: 0 });
  const [installSources, setInstallSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [count, deepLinkCount, trendData, sources] = await Promise.all([
          getInstallCount(),
          getDeepLinkCount(),
          getInstallTrendData(),
          getInstallsBySource()
        ]);

        setInstallCount(count);
        setDeepLinkCount(deepLinkCount);
        setTrendData(trendData);
        setInstallSources(sources);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const renderTrendIndicator = () => {
    if (trendData.today > trendData.yesterday) {
      return <Text style={styles.trendUp}>↑ {Math.round((trendData.today / trendData.yesterday) * 100 - 100)}%</Text>;
    } else if (trendData.today < trendData.yesterday) {
      return <Text style={styles.trendDown}>↓ {Math.round(100 - (trendData.today / trendData.yesterday) * 100)}%</Text>;
    }
    return <Text style={styles.trendNeutral}>→ 0%</Text>;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Install Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Installs</Text>
            <Text style={styles.statValue}>{installCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Deep Links</Text>
            <Text style={styles.statValue}>{deepLinkCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Install Trends</Text>
        <View style={styles.trendContainer}>
          <View style={styles.trendBox}>
            <Text style={styles.trendLabel}>Today</Text>
            <Text style={styles.trendValue}>{trendData.today}</Text>
          </View>
          <View style={styles.trendBox}>
            <Text style={styles.trendLabel}>Yesterday</Text>
            <Text style={styles.trendValue}>{trendData.yesterday}</Text>
          </View>
          <View style={styles.trendBox}>
            <Text style={styles.trendLabel}>Change</Text>
            {renderTrendIndicator()}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Install Sources</Text>
        {installSources.length > 0 ? (
          installSources.map((source, index) => (
            <View key={index} style={styles.sourceRow}>
              <Text style={styles.sourceName}>{source.source || 'Unknown'}</Text>
              <Text style={styles.sourceCount}>{source.count}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No install data available</Text>
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
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  trendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendBox: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  trendLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  trendUp: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  trendDown: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  trendNeutral: {
    color: '#f39c12',
    fontWeight: 'bold',
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sourceName: {
    fontSize: 16,
    color: '#333',
  },
  sourceCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Analytics;
