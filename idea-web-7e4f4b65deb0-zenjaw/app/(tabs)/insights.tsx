import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import PremiumGate from '@/components/PremiumGate';
import { useTensionLog } from '@/hooks/useTensionLog';
import { usePremium } from '@/hooks/usePremium';
import { Colors } from '@/constants/colors';

export default function InsightsScreen() {
  const { logs, loading, calculateTensionScore, identifyPatterns } = useTensionLog();
  const { isPremium, purchasePremium } = usePremium();
  const [viewDays, setViewDays] = useState<7 | 30>(7);
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  const handleViewToggle = (days: 7 | 30) => {
    if (days === 30 && !isPremium) {
      setShowPremiumGate(true);
      return;
    }
    setViewDays(days);
  };

  const handleUpgrade = () => {
    purchasePremium();
    setShowPremiumGate(false);
    setViewDays(30);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </SafeAreaView>
    );
  }

  const currentLogs = logs.filter(log => {
    const cutoff = Date.now() - viewDays * 24 * 60 * 60 * 1000;
    return log.timestamp >= cutoff;
  });

  const previousLogs = logs.filter(log => {
    const cutoff = Date.now() - viewDays * 24 * 60 * 60 * 1000;
    const previousCutoff = cutoff - viewDays * 24 * 60 * 60 * 1000;
    return log.timestamp >= previousCutoff && log.timestamp < cutoff;
  });

  const tensionScore = calculateTensionScore(currentLogs);
  const previousScore = calculateTensionScore(previousLogs);
  const scoreChange = previousScore > 0 ? ((previousScore - tensionScore) / previousScore) * 100 : 0;

  const patterns = identifyPatterns(currentLogs);

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  };

  const getTrendText = () => {
    if (currentLogs.length === 0) {
      return 'Start logging to see your trends';
    }
    if (previousLogs.length === 0) {
      return 'Keep logging to track your progress';
    }
    if (scoreChange > 0) {
      return `Your tension has decreased ${Math.abs(scoreChange).toFixed(0)}% this ${viewDays === 7 ? 'week' : 'month'}`;
    } else if (scoreChange < 0) {
      return `Your tension has increased ${Math.abs(scoreChange).toFixed(0)}% this ${viewDays === 7 ? 'week' : 'month'}`;
    } else {
      return `Your tension levels are stable this ${viewDays === 7 ? 'week' : 'month'}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, viewDays === 7 && styles.toggleButtonActive]}
            onPress={() => handleViewToggle(7)}
          >
            <Text style={[styles.toggleText, viewDays === 7 && styles.toggleTextActive]}>
              7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewDays === 30 && styles.toggleButtonActive]}
            onPress={() => handleViewToggle(30)}
          >
            <Text style={[styles.toggleText, viewDays === 30 && styles.toggleTextActive]}>
              30 Days
            </Text>
            {!isPremium && <Text style={styles.premiumBadge}>Premium</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {currentLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyText}>
              Start logging your tension to see insights and patterns
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tension Heatmap</Text>
              <HeatmapCalendar logs={currentLogs} days={viewDays} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tension Score</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>{(tensionScore * 100).toFixed(0)}%</Text>
                <Text style={styles.scoreLabel}>of logs were tense</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${tensionScore * 100}%`, backgroundColor: Colors.light.tense }
                  ]}
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Trend</Text>
              <Text style={styles.trendText}>{getTrendText()}</Text>
            </View>

            {patterns.peakHours.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Peak Tension Hours</Text>
                <Text style={styles.patternText}>
                  You're most tense at {patterns.peakHours.map(formatHour).join(', ')}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <PremiumGate
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        onUpgrade={handleUpgrade}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.icon,
  },
  toggleTextActive: {
    color: '#fff',
  },
  premiumBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.tint,
    backgroundColor: Colors.light.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  scoreLabel: {
    fontSize: 16,
    color: Colors.light.icon,
    marginTop: 4,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.light.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  trendText: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  patternText: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
});
