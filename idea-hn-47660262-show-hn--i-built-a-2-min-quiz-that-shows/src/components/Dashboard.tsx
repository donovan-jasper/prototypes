import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getDecisions, getCalibrationStats } from '../utils/storage';
import { calculateBetaDistribution } from '../utils/betaDistribution';
import { Decision } from '../types/Decision';

const Dashboard: React.FC = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [stats, setStats] = useState<{ totalSuccesses: number; totalFailures: number } | null>(null);
  const [betaResult, setBetaResult] = useState<ReturnType<typeof calculateBetaDistribution> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [decisionsData, statsData] = await Promise.all([
          getDecisions(),
          getCalibrationStats()
        ]);

        setDecisions(decisionsData);
        setStats(statsData);

        if (statsData.totalSuccesses + statsData.totalFailures > 0) {
          const result = calculateBetaDistribution(statsData.totalSuccesses, statsData.totalFailures);
          setBetaResult(result);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your calibration data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Calibration Dashboard</Text>

      {betaResult && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overall Calibration Score</Text>
          <Text style={styles.summaryValue}>{betaResult.mean.toFixed(2)}</Text>
          <Text style={styles.summaryText}>
            Confidence Interval: {betaResult.confidenceInterval[0].toFixed(2)} - {betaResult.confidenceInterval[1].toFixed(2)}
          </Text>
          <Text style={styles.summaryText}>
            Based on {stats?.totalSuccesses} successful estimates and {stats?.totalFailures} missed estimates
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Decisions</Text>
        {decisions.length > 0 ? (
          decisions.map((decision) => (
            <View key={decision.id} style={styles.decisionCard}>
              <Text style={styles.decisionDescription}>{decision.description}</Text>
              <View style={styles.decisionValues}>
                <Text style={styles.decisionValue}>Estimated: ${decision.estimatedValue.toFixed(2)}</Text>
                <Text style={styles.decisionValue}>Actual: ${decision.actualValue.toFixed(2)}</Text>
              </View>
              <Text style={[
                styles.decisionResult,
                decision.successes > 0 ? styles.success : styles.failure
              ]}>
                {decision.successes > 0 ? 'Good Estimate' : 'Missed Estimate'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No decisions recorded yet. Complete a quiz to see your progress!</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#444',
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginVertical: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  decisionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  decisionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  decisionValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  decisionValue: {
    fontSize: 14,
    color: '#666',
  },
  decisionResult: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  success: {
    color: '#4CAF50',
  },
  failure: {
    color: '#F44336',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Dashboard;
