import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { generatePersonalizedInsights, getCategoryBreakdown, getSpendingTrends } from '../../services/coaching';

const { width } = Dimensions.get('window');

export default function CoachingScreen({ navigation }) {
  const [insights, setInsights] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [spendingTrends, setSpendingTrends] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [insightsData, categoryData, trendsData] = await Promise.all([
      generatePersonalizedInsights(),
      getCategoryBreakdown(),
      getSpendingTrends()
    ]);

    setInsights(insightsData.sort((a, b) => a.priority - b.priority));
    setCategoryBreakdown(categoryData);
    setSpendingTrends(trendsData);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function getInsightIcon(type) {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'tip': return '💡';
      default: return 'ℹ️';
    }
  }

  function getInsightColor(type) {
    switch (type) {
      case 'warning': return '#FF9500';
      case 'success': return '#34C759';
      case 'tip': return '#007AFF';
      default: return '#8E8E93';
    }
  }

  function getPriorityLabel(priority) {
    switch (priority) {
      case 1: return 'High Priority';
      case 2: return 'Medium Priority';
      case 3: return 'Low Priority';
      default: return 'Priority';
    }
  }

  function getInsightBackgroundColor(type) {
    switch (type) {
      case 'warning': return 'rgba(255, 149, 0, 0.1)';
      case 'success': return 'rgba(52, 199, 89, 0.1)';
      case 'tip': return 'rgba(0, 122, 255, 0.1)';
      default: return 'rgba(142, 142, 147, 0.1)';
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Financial Coaching</Text>
        <Text style={styles.subtitle}>Personalized insights to help you manage your money better</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Refresh Insights</Text>
        </TouchableOpacity>
      </View>

      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Insights</Text>
          {insights.map((insight, index) => (
            <View
              key={index}
              style={[
                styles.insightCard,
                { backgroundColor: getInsightBackgroundColor(insight.type) }
              ]}
            >
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>{getInsightIcon(insight.type)}</Text>
                <View style={styles.insightHeaderText}>
                  <Text style={styles.insightCategory}>{insight.category}</Text>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
              </View>
              <Text style={styles.insightMessage}>{insight.message}</Text>
              <View style={styles.insightFooter}>
                <Text style={[styles.priorityBadge, { backgroundColor: getInsightColor(insight.type) }]}>
                  {getPriorityLabel(insight.priority)}
                </Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('InsightsList')}
          >
            <Text style={styles.viewAllButtonText}>View All Insights</Text>
          </TouchableOpacity>
        </View>
      )}

      {categoryBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <View style={styles.categoryCard}>
            {categoryBreakdown.map((category, index) => (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.category}</Text>
                  <Text style={styles.categoryCount}>{category.count} transactions</Text>
                </View>
                <View style={styles.categoryAmounts}>
                  <Text style={styles.categoryAmount}>${category.total.toFixed(2)}</Text>
                  <Text style={styles.categoryPercent}>{category.percentage.toFixed(0)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {spendingTrends.length > 0 && spendingTrends.some(t => t.total > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6-Month Spending Trend</Text>
          <View style={styles.trendCard}>
            {spendingTrends.map((trend, index) => {
              const maxAmount = Math.max(...spendingTrends.map(t => t.total));
              const barWidth = (trend.total / maxAmount) * (width - 60);

              return (
                <View key={index} style={styles.trendRow}>
                  <Text style={styles.trendMonth}>{trend.month}</Text>
                  <View style={styles.trendBarContainer}>
                    <View style={[styles.trendBar, { width: barWidth }]} />
                  </View>
                  <Text style={styles.trendAmount}>${trend.total.toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  insightCard: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  insightHeaderText: {
    flex: 1,
  },
  insightCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  insightMessage: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
    lineHeight: 20,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  priorityBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  viewAllButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  viewAllButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  categoryAmounts: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryPercent: {
    fontSize: 12,
    color: '#666',
  },
  trendCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendMonth: {
    width: 60,
    fontSize: 14,
    color: '#666',
  },
  trendBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  trendBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  trendAmount: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
});
