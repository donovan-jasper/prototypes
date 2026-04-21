import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Alert, Platform } from 'react-native';
import { Text, Button, Divider, Card, Chip, ProgressBar, TextInput, useTheme, Portal, Modal } from 'react-native-paper';
import CostChart from '../../components/CostChart';
import { getUsageHistory, getMonthlyTotal, logUsage, getSetting } from '../../services/database';
import { UsageEntry, AIModel, TaskType } from '../../types/models';
import { projectMonthlyCost, calculateCost } from '../../services/costCalculator';
import { getAllModels, getModelById } from '../../services/modelService';
import { Picker } from '@react-native-picker/picker';

export default function TrackerScreen() {
  const theme = useTheme();
  const [usageHistory, setUsageHistory] = useState<UsageEntry[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [projectedCost, setProjectedCost] = useState<number | null>(null);
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<AIModel[]>([]);

  // State for manual usage logging form
  const [showLogForm, setShowLogForm] = useState(false);
  const [formModelId, setFormModelId] = useState<string>('');
  const [formTaskType, setFormTaskType] = useState<TaskType | ''>('');
  const [formInputTokens, setFormInputTokens] = useState<string>('');
  const [formOutputTokens, setFormOutputTokens] = useState<string>('');
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  // Data for CostChart
  const [dailyChartData, setDailyChartData] = useState<Array<{ date: string; cost: number }>>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const history = await getUsageHistory();
      const total = await getMonthlyTotal();
      const allModels = getAllModels();

      setUsageHistory(history);
      setMonthlyTotal(total);
      setModels(allModels);

      // Prepare data for chart and projection: group by date for daily totals
      const dailyChartDataMap = history.reduce((acc, entry) => {
        const date = new Date(entry.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
        acc.set(date, (acc.get(date) || 0) + entry.cost);
        return acc;
      }, new Map<string, number>());

      const chartDataForProjection = Array.from(dailyChartDataMap.entries())
        .map(([date, cost]) => ({ date, cost }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setDailyChartData(chartDataForProjection); // Set for CostChart

      // Project monthly cost
      const projected = projectMonthlyCost(chartDataForProjection);
      setProjectedCost(projected);

      // Load budget limit
      const limit = await getSetting('budget_limit');
      if (limit) setBudgetLimit(parseFloat(limit));

      // Initialize formModelId if models are available and not already set
      if (allModels.length > 0 && !formModelId) {
        setFormModelId(allModels[0].id);
      }
      // Initialize formTaskType if not already set
      if (!formTaskType) {
        setFormTaskType(TaskType.TEXT_GENERATION);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load cost data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formModelId, formTaskType]); // Added formModelId, formTaskType to dependencies to avoid re-initializing if already set

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Effect to calculate cost dynamically when form inputs change
  useEffect(() => {
    const calculateEstimatedCost = () => {
      const selectedModel = getModelById(formModelId);
      const input = parseInt(formInputTokens, 10);
      const output = parseInt(formOutputTokens, 10);

      if (selectedModel && !isNaN(input) && !isNaN(output) && input >= 0 && output >= 0) {
        const cost = calculateCost(selectedModel, input, output);
        setCalculatedCost(cost);
      } else {
        setCalculatedCost(null);
      }
    };
    calculateEstimatedCost();
  }, [formModelId, formInputTokens, formOutputTokens, models]); // Re-calculate when these change

  const handleLogUsage = async () => {
    if (!formModelId || !formTaskType || !formInputTokens || !formOutputTokens || calculatedCost === null || calculatedCost < 0) {
      Alert.alert('Missing Information', 'Please fill in all fields and ensure a valid cost is calculated.');
      return;
    }

    const inputTokensNum = parseInt(formInputTokens, 10);
    const outputTokensNum = parseInt(formOutputTokens, 10);

    if (isNaN(inputTokensNum) || isNaN(outputTokensNum) || inputTokensNum < 0 || outputTokensNum < 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers for tokens.');
      return;
    }

    setIsLogging(true);
    try {
      await logUsage({
        modelId: formModelId,
        taskType: formTaskType,
        inputTokens: inputTokensNum,
        outputTokens: outputTokensNum,
        cost: calculatedCost,
        timestamp: Date.now(),
      });
      Alert.alert('Success', 'Usage logged successfully!');
      // Reset form
      setFormModelId(models.length > 0 ? models[0].id : '');
      setFormTaskType(TaskType.TEXT_GENERATION);
      setFormInputTokens('');
      setFormOutputTokens('');
      setCalculatedCost(null);
      setShowLogForm(false); // Close modal
      loadData(); // Reload all data
    } catch (error) {
      console.error('Error logging usage:', error);
      Alert.alert('Error', 'Failed to log usage. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const budgetProgress = budgetLimit ? monthlyTotal / budgetLimit : 0;
  const budgetColor = budgetProgress > 0.9 ? theme.colors.error : budgetProgress > 0.75 ? theme.colors.warning : theme.colors.primary;

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading cost data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text variant="headlineMedium" style={styles.headerTitle}>
        AI Cost Tracker
      </Text>

      {/* Current Month's Total */}
      <Card style={styles.totalCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            {currentMonthName} Total
          </Text>
          <Text variant="displaySmall" style={styles.monthlyTotalText}>
            ${monthlyTotal.toFixed(2)}
          </Text>
          {projectedCost !== null && (
            <Text variant="bodyMedium" style={styles.projectedText}>
              Projected: ${projectedCost.toFixed(2)}
            </Text>
          )}
          {budgetLimit !== null && (
            <View style={styles.budgetContainer}>
              <Text variant="bodySmall" style={styles.budgetText}>
                Budget: ${budgetLimit.toFixed(2)}
              </Text>
              <ProgressBar progress={budgetProgress} color={budgetColor} style={styles.progressBar} />
              <Text variant="bodySmall" style={styles.budgetRemainingText}>
                {budgetLimit - monthlyTotal > 0
                  ? `$${(budgetLimit - monthlyTotal).toFixed(2)} remaining`
                  : `$${(monthlyTotal - budgetLimit).toFixed(2)} over budget`}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Cost Chart */}
      <CostChart data={dailyChartData} />

      <Divider style={styles.divider} />

      {/* Log New Usage Button */}
      <Button
        mode="contained"
        icon="plus-circle"
        onPress={() => setShowLogForm(true)}
        style={styles.logButton}
        labelStyle={styles.logButtonLabel}
      >
        Log New AI Usage
      </Button>

      {/* Manual Usage Logging Form Modal */}
      <Portal>
        <Modal visible={showLogForm} onDismiss={() => setShowLogForm(false)} contentContainerStyle={styles.modalContent}>
          <ScrollView>
            <Text variant="titleLarge" style={styles.formTitle}>Log New Usage Entry</Text>

            <Text style={styles.pickerLabel}>AI Model:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formModelId}
                onValueChange={(itemValue) => setFormModelId(itemValue as string)}
                style={styles.picker}
              >
                {models.map((model) => (
                  <Picker.Item key={model.id} label={model.name} value={model.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.pickerLabel}>Task Type:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formTaskType}
                onValueChange={(itemValue) => setFormTaskType(itemValue as TaskType)}
                style={styles.picker}
              >
                {Object.values(TaskType).map((type) => (
                  <Picker.Item key={type} label={type.replace(/_/g, ' ').toUpperCase()} value={type} />
                ))}
              </Picker>
            </View>

            <TextInput
              label="Input Tokens"
              value={formInputTokens}
              onChangeText={setFormInputTokens}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Output Tokens"
              value={formOutputTokens}
              onChangeText={setFormOutputTokens}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            {calculatedCost !== null && (
              <Text variant="titleMedium" style={styles.calculatedCostText}>
                Estimated Cost: ${calculatedCost.toFixed(4)}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleLogUsage}
              loading={isLogging}
              disabled={isLogging || calculatedCost === null || calculatedCost < 0}
              style={styles.submitButton}
            >
              Log Usage
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowLogForm(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      <Divider style={styles.divider} />

      {/* Recently Logged Usage */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Recent Usage History
      </Text>
      {usageHistory.length === 0 ? (
        <Text style={styles.emptyHistoryText}>No usage logged yet. Start logging above!</Text>
      ) : (
        <View style={styles.historyList}>
          {usageHistory.map((entry) => {
            const model = getModelById(entry.modelId);
            const entryDate = new Date(entry.timestamp);
            return (
              <Card key={entry.id} style={styles.historyCard}>
                <Card.Content>
                  <View style={styles.historyCardHeader}>
                    <Text variant="titleMedium" style={styles.historyModelName}>
                      {model?.name || entry.modelId}
                    </Text>
                    <Chip style={styles.historyCostChip} textStyle={styles.historyCostChipText}>
                      ${entry.cost.toFixed(4)}
                    </Chip>
                  </View>
                  <Text variant="bodyMedium">
                    Task: {entry.taskType.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text variant="bodySmall" style={styles.historyTokens}>
                    Input: {entry.inputTokens} tokens | Output: {entry.outputTokens} tokens
                  </Text>
                  <Text variant="bodySmall" style={styles.historyTimestamp}>
                    {entryDate.toLocaleString()}
                  </Text>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light background
  },
  contentContainer: {
    paddingBottom: 24,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardTitle: {
    marginBottom: 8,
    color: '#666',
  },
  monthlyTotalText: {
    fontWeight: 'bold',
    color: '#4CAF50', // Green for cost
    marginBottom: 4,
  },
  projectedText: {
    color: '#888',
    marginBottom: 12,
  },
  budgetContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  budgetText: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  budgetRemainingText: {
    textAlign: 'right',
    color: '#888',
  },
  divider: {
    marginVertical: 20,
    marginHorizontal: 16,
    backgroundColor: '#eee',
  },
  logButton: {
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logButtonLabel: {
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%', // Limit height for scrollability
  },
  formTitle: {
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden', // Ensures picker doesn't overflow border radius
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50, // Adjust height for iOS picker
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  calculatedCostText: {
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    marginBottom: 40,
  },
  historyList: {
    marginHorizontal: 16,
  },
  historyCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: '#fff',
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyModelName: {
    fontWeight: 'bold',
    flexShrink: 1,
    marginRight: 8,
  },
  historyCostChip: {
    backgroundColor: '#E8F5E9', // Light green background
  },
  historyCostChipText: {
    color: '#2E7D32', // Darker green text
    fontWeight: 'bold',
  },
  historyTokens: {
    color: '#777',
    marginTop: 4,
  },
  historyTimestamp: {
    color: '#999',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'right',
  },
});
