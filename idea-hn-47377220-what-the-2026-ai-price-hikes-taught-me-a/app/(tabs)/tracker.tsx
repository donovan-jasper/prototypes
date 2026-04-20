import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { Text, Button, Divider, Card, Chip, ProgressBar, Dialog, Portal, TextInput, useTheme } from 'react-native-paper';
import CostChart from '../../components/CostChart';
import { getUsageHistory, getMonthlyTotal, logUsage, getSetting } from '../../services/database';
import { UsageEntry, AIModel, TaskType } from '../../types/models';
import { projectMonthlyCost, calculateSavings } from '../../services/costCalculator';
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
  const [formModelId, setFormModelId] = useState<string>('');
  const [formTaskType, setFormTaskType] = useState<TaskType | ''>('');
  const [formInputTokens, setFormInputTokens] = useState<string>('');
  const [formOutputTokens, setFormOutputTokens] = useState<string>('');
  const [formCost, setFormCost] = useState<string>('');
  const [isLogging, setIsLogging] = useState(false);

  // State for What-If scenario
  const [whatIfVisible, setWhatIfVisible] = useState(false);
  const [whatIfModel, setWhatIfModel] = useState<string>('');
  const [whatIfSavings, setWhatIfSavings] = useState<number>(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const history = await getUsageHistory();
      const total = await getMonthlyTotal();
      const allModels = await getAllModels();

      setUsageHistory(history);
      setMonthlyTotal(total);
      setModels(allModels);

      // Prepare data for chart: group by date for daily totals
      const dailyChartDataMap = history.reduce((acc, entry) => {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        acc.set(date, (acc.get(date) || 0) + entry.cost);
        return acc;
      }, new Map<string, number>());

      const chartData = Array.from(dailyChartDataMap.entries())
        .map(([date, cost]) => ({ date, cost }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Project monthly cost
      const projected = projectMonthlyCost(chartData);
      setProjectedCost(projected);

      // Load budget limit
      const limit = await getSetting('budget_limit');
      if (limit) setBudgetLimit(parseFloat(limit));

      // Set initial form model if models are available and not already set
      if (allModels.length > 0 && !formModelId) {
        setFormModelId(allModels[0].id);
      }
      // Set initial form task type if not already set
      if (!formTaskType) {
        setFormTaskType(TaskType.TEXT_GENERATION); // Default task type
      }

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load cost data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formModelId, formTaskType]); // Dependencies to avoid re-setting defaults if user has selected something

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogUsage = async () => {
    if (!formModelId || !formTaskType || !formInputTokens || !formOutputTokens || !formCost) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    const inputTokensNum = parseInt(formInputTokens, 10);
    const outputTokensNum = parseInt(formOutputTokens, 10);
    const costNum = parseFloat(formCost);

    if (isNaN(inputTokensNum) || isNaN(outputTokensNum) || isNaN(costNum) || inputTokensNum < 0 || outputTokensNum < 0 || costNum < 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers for tokens and cost.');
      return;
    }

    setIsLogging(true);
    try {
      const newEntry: UsageEntry = {
        modelId: formModelId,
        taskType: formTaskType as TaskType, // Cast to TaskType
        inputTokens: inputTokensNum,
        outputTokens: outputTokensNum,
        cost: costNum,
        timestamp: Date.now(),
      };
      await logUsage(newEntry);
      Alert.alert('Success', 'Usage logged successfully!');
      // Clear form
      setFormInputTokens('');
      setFormOutputTokens('');
      setFormCost('');
      // Reload data to update totals and history
      await loadData();
    } catch (error) {
      console.error('Error logging usage:', error);
      Alert.alert('Error', 'Failed to log usage. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const getBudgetProgress = () => {
    if (!budgetLimit || !projectedCost) return 0;
    return Math.min(projectedCost / budgetLimit, 1);
  };

  const getBudgetStatusColor = () => {
    const progress = getBudgetProgress();
    if (progress > 0.9) return theme.colors.error; // Red
    if (progress > 0.7) return '#ff9800'; // Orange
    return theme.colors.primary; // Green
  };

  const calculateWhatIfSavings = () => {
    if (!whatIfModel) return 0;

    const selectedModel = models.find(m => m.id === whatIfModel);
    if (!selectedModel) return 0;

    // Calculate total savings if all *past* tasks used this model instead
    const totalSavings = usageHistory.reduce((sum, entry) => {
      const currentModel = getModelById(entry.modelId); // Use getModelById to ensure we have the full model object
      if (currentModel) {
        const savings = calculateSavings(
          currentModel,
          selectedModel,
          entry.inputTokens,
          entry.outputTokens
        );
        return sum + savings;
      }
      return sum;
    }, 0);

    return totalSavings;
  };

  const handleWhatIfSubmit = () => {
    const savings = calculateWhatIfSavings();
    setWhatIfSavings(savings);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your cost data...</Text>
      </View>
    );
  }

  // Prepare data for CostChart component (re-calculate if usageHistory changes)
  const dailyChartDataMap = usageHistory.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    acc.set(date, (acc.get(date) || 0) + entry.cost);
    return acc;
  }, new Map<string, number>());

  const chartDataForComponent = Array.from(dailyChartDataMap.entries())
    .map(([date, cost]) => ({ date, cost }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


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

      {/* Monthly Total Display */}
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
          {budgetLimit !== null && projectedCost !== null && (
            <View style={styles.budgetProgressContainer}>
              <Text variant="bodySmall" style={styles.budgetLabel}>
                Budget: ${budgetLimit.toFixed(2)}
              </Text>
              <ProgressBar
                progress={getBudgetProgress()}
                color={getBudgetStatusColor()}
                style={styles.progressBar}
              />
              {getBudgetProgress() >= 1 && (
                <Text style={{ color: theme.colors.error, marginTop: 4 }}>
                  You are over your budget limit!
                </Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Manual Usage Logging Form */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.formTitle}>Log New Usage</Text>

          <Text style={styles.pickerLabel}>Select Model:</Text>
          <Picker
            selectedValue={formModelId}
            onValueChange={(itemValue) => setFormModelId(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {models.length === 0 ? (
              <Picker.Item label="No models available" value="" />
            ) : (
              models.map((model) => (
                <Picker.Item key={model.id} label={model.name} value={model.id} />
              ))
            )}
          </Picker>

          <Text style={styles.pickerLabel}>Select Task Type:</Text>
          <Picker
            selectedValue={formTaskType}
            onValueChange={(itemValue) => setFormTaskType(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {Object.values(TaskType).map((type) => (
              <Picker.Item key={type} label={type.replace(/_/g, ' ').toUpperCase()} value={type} />
            ))}
          </Picker>

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
          <TextInput
            label="Cost ($)"
            value={formCost}
            onChangeText={setFormCost}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleLogUsage}
            loading={isLogging}
            disabled={isLogging || models.length === 0}
            style={styles.logButton}
            icon="plus-circle"
          >
            Log Usage
          </Button>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Cost Chart */}
      <CostChart data={chartDataForComponent} />

      <Divider style={styles.divider} />

      {/* Recent Usage Entries */}
      <View style={styles.recentUsageContainer}>
        <Text variant="titleMedium" style={styles.recentUsageTitle}>Recent Usage</Text>
        {usageHistory.length === 0 ? (
          <Text style={styles.emptyStateText}>No recent usage entries. Log some AI tasks!</Text>
        ) : (
          usageHistory.map((entry, index) => {
            const model = getModelById(entry.modelId);
            return (
              <Card key={entry.id || index} style={styles.usageEntryCard}>
                <Card.Content>
                  <View style={styles.usageEntryHeader}>
                    <Text variant="titleSmall" style={styles.usageModelName}>
                      {model?.name || entry.modelId}
                    </Text>
                    <Chip style={styles.costChip} textStyle={{ color: theme.colors.onPrimaryContainer }}>
                      ${entry.cost.toFixed(4)}
                    </Chip>
                  </View>
                  <Text variant="bodySmall" style={styles.usageDetails}>
                    Task: {entry.taskType.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text variant="bodySmall" style={styles.usageDetails}>
                    Tokens: {entry.inputTokens} (in) / {entry.outputTokens} (out)
                  </Text>
                  <Text variant="bodySmall" style={styles.usageTimestamp}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </Text>
                </Card.Content>
              </Card>
            );
          })
        )}
      </View>

      <Divider style={styles.divider} />

      {/* What-If Scenario */}
      <Card style={styles.whatIfCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.whatIfTitle}>What-If Scenario</Text>
          <Text variant="bodyMedium" style={styles.whatIfSubtitle}>
            See potential savings if you switched models.
          </Text>
          <Button mode="outlined" onPress={() => {
            setWhatIfVisible(true);
            setWhatIfSavings(0); // Reset savings when opening dialog
            if (models.length > 0 && !whatIfModel) {
              setWhatIfModel(models[0].id); // Set default model for what-if
            }
          }} style={styles.whatIfButton}>
            Calculate Savings
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog visible={whatIfVisible} onDismiss={() => setWhatIfVisible(false)}>
          <Dialog.Title>Calculate What-If Savings</Dialog.Title>
          <Dialog.Content>
            <Text>Select an alternative model to compare against your past usage:</Text>
            <Picker
              selectedValue={whatIfModel}
              onValueChange={(itemValue) => {
                setWhatIfModel(itemValue);
                setWhatIfSavings(0); // Reset savings when model changes
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {models.length === 0 ? (
                <Picker.Item label="No models available" value="" />
              ) : (
                models.map((model) => (
                  <Picker.Item key={model.id} label={model.name} value={model.id} />
                ))
              )}
            </Picker>
            {whatIfSavings !== 0 && (
              <Text style={styles.whatIfResult}>
                {whatIfSavings > 0 ? 'Projected savings:' : 'Projected additional cost:'}{' '}
                <Text style={{ fontWeight: 'bold', color: whatIfSavings > 0 ? theme.colors.primary : theme.colors.error }}>
                  ${Math.abs(whatIfSavings).toFixed(2)}
                </Text>
              </Text>
            )}
            {whatIfModel && whatIfSavings === 0 && (
                <Text style={styles.whatIfResult}>
                    Select a model and tap 'Calculate' to see potential changes.
                </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setWhatIfVisible(false)}>Cancel</Button>
            <Button onPress={handleWhatIfSubmit} disabled={!whatIfModel}>Calculate</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={{ height: 50 }} /> {/* Spacer at the bottom */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  subtitle: {
    color: '#666',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#4CAF50',
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
  budgetProgressContainer: {
    marginTop: 8,
  },
  budgetLabel: {
    marginBottom: 4,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  divider: {
    marginVertical: 16,
    marginHorizontal: 16,
    backgroundColor: '#e0e0e0',
  },
  formCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  formTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 12,
  },
  picker: {
    height: 50,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center', // Center content vertically
  },
  pickerItem: {
    fontSize: 16,
    height: 50, // Ensure item height matches picker height
  },
  logButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  recentUsageContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  recentUsage
