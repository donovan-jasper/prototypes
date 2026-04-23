import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { isPremiumUser, initDatabase } from '../../lib/database';
import { PULSE_TRENDS } from '../../lib/pulse-data';

export default function PulseScreen() {
  const [isPremium, setIsPremium] = useState(false);
  const [trends, setTrends] = useState(PULSE_TRENDS);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  async function loadPremiumStatus() {
    await initDatabase();
    const premium = await isPremiumUser();
    setIsPremium(premium);
  }

  async function handleRefresh() {
    setIsLoading(true);
    // Simulate API call with a delay
    setTimeout(() => {
      // In a real app, this would fetch new data from an API
      // For now, we'll just shuffle the existing trends
      const shuffled = [...PULSE_TRENDS].sort(() => Math.random() - 0.5);
      setTrends(shuffled);
      setIsLoading(false);
    }, 1000);
  }

  const visibleTrends = isPremium ? trends : trends.slice(0, 3);
  const hiddenCount = trends.length - visibleTrends.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Job Security Pulse</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#3b82f6" />
          ) : (
            <Text style={styles.refreshText}>Refresh</Text>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        Weekly trends showing which tech skills and roles are heating up or cooling down
      </Text>

      <View style={styles.trendsContainer}>
        {visibleTrends.map((trend) => (
          <View key={trend.id} style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.skillName}>{trend.skillName}</Text>
              <View style={[
                styles.trendBadge,
                { backgroundColor: trend.direction === 'up' ? '#10b981' : '#ef4444' }
              ]}>
                <Text style={styles.trendIcon}>
                  {trend.direction === 'up' ? '↑' : '↓'}
                </Text>
                <Text style={styles.trendPercentage}>{trend.percentage}</Text>
              </View>
            </View>

            <Text style={styles.insight}>{trend.insight}</Text>

            <Text style={styles.timestamp}>
              {new Date(trend.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
        ))}
      </View>

      {!isPremium && hiddenCount > 0 && (
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>Unlock {hiddenCount} More Trends</Text>
          <Text style={styles.paywallText}>
            Get full weekly reports with historical data and detailed market analysis
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827'
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#e0f2fe',
    borderRadius: 8
  },
  refreshText: {
    color: '#3b82f6',
    fontWeight: '600'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 22
  },
  trendsContainer: {
    gap: 16
  },
  trendCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  skillName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4
  },
  trendIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  trendPercentage: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  insight: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12
  },
  timestamp: {
    fontSize: 13,
    color: '#9ca3af'
  },
  paywallCard: {
    backgroundColor: '#8b5cf6',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40
  },
  paywallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  paywallText: {
    fontSize: 14,
    color: '#e9d5ff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20
  },
  upgradeButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  upgradeButtonText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600'
  }
});
