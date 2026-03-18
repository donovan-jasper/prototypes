import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { generatePersonalizedInsights, getCategoryBreakdown, getSpendingTrends } from '../../services/coaching';

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
    
    setInsights(insightsData);
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

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Financial Coaching</Text>
      
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
                  </View>
                  <Text style={styles.trendAmount}>${trend.total.toFixed(0)}</Text>
                  <Text style={styles.trendMonth}>{trend.month}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {insights.length === 0 && categoryBreakdown.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📊</Text>
          <Text style={styles.emptyStateTitle}>No Data Yet</Text>
          <Text style={styles.emptyStateMessage}>
            Start tracking your expenses and income to receive personalized financial insights and recommendations.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    margin: 20,
    marginBottom: 10
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 10,
    color: '#333'
  },
  insightCard: { 
    backgroundColor: 'white', 
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12
  },
  insightHeaderText: {
    flex: 1
  },
  insightCategory: { 
    fontSize: 11, 
    color: '#8E8E93',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4
  },
  insightMessage: { 
    fontSize: 14, 
    lineHeight: 20,
    color: '#333'
  },
  categoryCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  categoryInfo: {
    flex: 1
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2
  },
  categoryCount: {
    fontSize: 12,
    color: '#8E8E93'
  },
  categoryAmounts: {
    alignItems: 'flex-end'
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2
  },
  categoryPercent: {
    fontSize: 12,
    color: '#8E8E93'
  },
  trendCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  trendBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2
  },
  trendBarContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  trendBarFill: {
    width: '80%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
    minHeight: 2
  },
  trendAmount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
    marginTop: 4
  },
  trendMonth: {
    fontSize: 9,
    color: '#8E8E93',
    marginTop: 2
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20
  }
});
