import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScoreCard from '../../components/ScoreCard';
import { getLatestScore, isPremiumUser, initDatabase } from '../../lib/database';
import { getScoreCategory, getScoreInsights } from '../../lib/scoring';

export default function ScoreScreen() {
  const [score, setScore] = useState<number | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [role, setRole] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    loadScore();
  }, []);
  
  async function loadScore() {
    await initDatabase();
    const latest = await getLatestScore();
    const premium = await isPremiumUser();
    setIsPremium(premium);
    
    if (latest?.score !== undefined) {
      setScore(latest.score);
      setRole(latest.role);
      setInsights(getScoreInsights(latest.score, latest.role));
    }
  }
  
  if (score === null) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Get Your AI Resistance Score</Text>
        <Text style={styles.emptySubtitle}>
          Discover how future-proof your current role and skills are against AI automation
        </Text>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => router.push('/assessment')}
        >
          <Text style={styles.startButtonText}>Start Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const category = getScoreCategory(score);
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your AI Resistance Score</Text>
      
      <ScoreCard score={score} category={category} />
      
      <View style={styles.insights}>
        <Text style={styles.sectionTitle}>Key Insights</Text>
        {insights.slice(0, isPremium ? insights.length : 1).map((insight, i) => (
          <View key={i} style={styles.insightItem}>
            <Text style={styles.insightBullet}>•</Text>
            <Text style={styles.insight}>{insight}</Text>
          </View>
        ))}
        {!isPremium && insights.length > 1 && (
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.upgradeText}>Unlock {insights.length - 1} More Insights</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.retakeButton}
        onPress={() => router.push('/assessment')}
      >
        <Text style={styles.retakeText}>Retake Assessment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb'
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827'
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827'
  },
  insights: {
    marginTop: 24,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827'
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 12
  },
  insightBullet: {
    fontSize: 16,
    lineHeight: 24,
    marginRight: 8,
    color: '#3b82f6'
  },
  insight: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#374151'
  },
  upgradeButton: {
    marginTop: 16,
    backgroundColor: '#8b5cf6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  upgradeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  retakeButton: {
    marginTop: 24,
    marginBottom: 40,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6'
  },
  retakeText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 16
  }
});
