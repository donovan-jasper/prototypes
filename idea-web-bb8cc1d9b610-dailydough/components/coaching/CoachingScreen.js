import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { generatePersonalizedInsights, getCategoryBreakdown, getSpendingTrends } from '../../services/coaching';

const { width } = Dimensions.get('window');

export default function CoachingScreen() {
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
      </View>

      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Insights</Text>
          {insights.map((insight, index) => (
            <View
              key={index}
              style={[
                styles.insightCard,
                { borderLeftColor: getInsightColor(insight.type) }
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
              const barHeight = maxAmount > 0 ? (trend.total / maxAmount) * 100 : 0;

              return (
                <View key={index} style={styles.trendBar}>
                  <View style={styles.trendBarContainer}>
                    <View
                      style={[
                        styles.trendBarFill,
                        { height: `${barHeight}%` }
                      ]}
                    />
                    <Text style={styles.trendMonth}>{trend.month}</Text>
                    <Text style={styles.trendAmount}>${trend.total.toFixed(2)}</Text>
                  </View>
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
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 14,
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
    lineHeight: 20,
    marginBottom: 10,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  categoryCard: {
    backgroundColor: 'white',
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
    borderBottomColor: '#eee',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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
    fontSize: 14,
    color: '#666',
  },
  trendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trendBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  trendBarContainer: {
    height: 150,
    justifyContent: 'flex-end',
    width: '100%',
  },
  trendBarFill: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    width: '100%',
    alignSelf: 'center',
  },
  trendMonth: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  trendAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
    textAlign: 'center',
  },
});
