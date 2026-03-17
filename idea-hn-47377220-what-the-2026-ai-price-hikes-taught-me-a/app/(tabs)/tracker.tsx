import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text, Button, Divider, Card, Chip, ProgressBar } from 'react-native-paper';
import CostChart from '../../components/CostChart';
import { getUsageHistory, getMonthlyTotal } from '../../services/database';
import { UsageEntry } from '../../types/models';
import { projectMonthlyCost } from '../../services/costCalculator';

export default function TrackerScreen() {
  const [usageHistory, setUsageHistory] = useState<UsageEntry[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [projectedCost, setProjectedCost] = useState<number | null>(null);
  const [savingsOpportunities, setSavingsOpportunities] = useState<string[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const history = await getUsageHistory();
      const total = await getMonthlyTotal();

      setUsageHistory(history);
      setMonthlyTotal(total);

      // Prepare data for chart
      const chartData = history.reduce((acc, entry) => {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.cost += entry.cost;
        } else {
          acc.push({ date, cost: entry.cost });
        }
        return acc;
      }, [] as Array<{ date: string; cost: number }>);

      // Get AI projection
      const { projectedCost, savingsOpportunities } = await projectMonthlyCost(chartData);
      setProjectedCost(projectedCost);
      setSavingsOpportunities(savingsOpportunities);

      // Load budget limit
      const limit = await getSetting('budget_limit');
      if (limit) setBudgetLimit(parseFloat(limit));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBudgetProgress = () => {
    if (!budgetLimit || !projectedCost) return 0;
    return Math.min(projectedCost / budgetLimit, 1);
  };

  const getBudgetStatusColor = () => {
    const progress = getBudgetProgress();
    if (progress > 0.9) return '#f44336'; // Red
    if (progress > 0.7) return '#ff9800'; // Orange
    return '#4CAF50'; // Green
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your cost data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Cost Tracker
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Monitor your AI spending and identify savings opportunities
        </Text>
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <View>
              <Text variant="titleMedium">Monthly Total</Text>
              <Text variant="headlineSmall" style={styles.totalAmount}>
                ${monthlyTotal.toFixed(2)}
              </Text>
            </View>
            {projectedCost !== null && (
              <View style={styles.projectionContainer}>
                <Text variant="bodySmall" style={styles.projectionLabel}>
                  Projected
                </Text>
                <Text variant="bodyLarge" style={styles.projectionAmount}>
                  ${projectedCost.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {budgetLimit && projectedCost && (
            <View style={styles.budgetContainer}>
              <Text variant="bodyMedium" style={styles.budgetLabel}>
                Budget: ${budgetLimit.toFixed(2)}
              </Text>
              <ProgressBar
                progress={getBudgetProgress()}
                color={getBudgetStatusColor()}
                style={styles.budgetProgress}
              />
              <Text variant="bodySmall" style={styles.budgetStatus}>
                {getBudgetProgress() > 0.9 ? 'Warning: Approaching limit' :
                 getBudgetProgress() > 0.7 ? 'Caution: Near limit' : 'On track'}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <CostChart data={usageHistory.map(entry => ({
        date: new Date(entry.timestamp).toISOString(),
        cost: entry.cost
      }))} />

      {savingsOpportunities.length > 0 && (
        <View style={styles.savingsSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Savings Opportunities
          </Text>
          {savingsOpportunities.map((opportunity, index) => (
            <Chip key={index} style={styles.savingsChip} icon="lightbulb-on">
              {opportunity}
            </Chip>
          ))}
        </View>
      )}

      <Divider style={styles.divider} />

      <View style={styles.recentActivity}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Activity
        </Text>
        {usageHistory.slice(0, 5).map((entry, index) => (
          <Card key={index} style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityRow}>
                <View>
                  <Text variant="bodyMedium" style={styles.activityModel}>
                    {entry.modelId}
                  </Text>
                  <Text variant="bodySmall" style={styles.activityDate}>
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <Text variant="bodyLarge" style={styles.activityCost}>
                  ${entry.cost.toFixed(4)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Button
        mode="outlined"
        onPress={loadData}
        style={styles.refreshButton}
        icon="refresh"
      >
        Refresh Data
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  projectionContainer: {
    alignItems: 'flex-end',
  },
  projectionLabel: {
    color: '#666',
  },
  projectionAmount: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  budgetContainer: {
    marginTop: 16,
  },
  budgetLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  budgetProgress: {
    height: 8,
    borderRadius: 4,
  },
  budgetStatus: {
    marginTop: 4,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  savingsSection: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  savingsChip: {
    marginVertical: 4,
    marginRight: 8,
    backgroundColor: '#e8f5e9',
  },
  divider: {
    marginVertical: 24,
  },
  recentActivity: {
    marginBottom: 24,
  },
  activityCard: {
    marginBottom: 8,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityModel: {
    fontWeight: 'bold',
  },
  activityDate: {
    color: '#666',
    marginTop: 4,
  },
  activityCost: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  refreshButton: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
});
