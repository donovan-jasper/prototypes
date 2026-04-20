import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Divider } from 'react-native-paper';
import { TaskType } from '../../types/models';
import { matchModelsForTask } from '../../services/modelService';
import { estimateTokens } from '../../services/costCalculator';
import ModelCard from '../../components/ModelCard';

export default function HomeScreen() {
  const [taskDescription, setTaskDescription] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleFindModels = async () => {
    if (!taskDescription.trim()) {
      setRecommendations([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    let taskType = TaskType.TEXT_GENERATION;
    if (taskDescription.toLowerCase().includes('code')) {
      taskType = TaskType.CODE_GENERATION;
    } else if (taskDescription.toLowerCase().includes('summarize')) {
      taskType = TaskType.SUMMARIZATION;
    }

    const estimatedTokens = estimateTokens(taskDescription);

    const task = {
      description: taskDescription,
      type: taskType,
      estimatedInputTokens: estimatedTokens,
      estimatedOutputTokens: estimatedTokens * 2,
    };

    const matches = matchModelsForTask(task);
    setRecommendations(matches);
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Smart Model Matcher
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Describe your task and we'll find the best AI model recommendations
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="What do you need to do?"
          placeholder="e.g., Write a blog post about sustainable gardening"
          value={taskDescription}
          onChangeText={setTaskDescription}
          multiline
          style={styles.input}
          mode="outlined"
        />
        <Button
          mode="contained"
          onPress={handleFindModels}
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'Finding models...' : 'Find Best Models'}
        </Button>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analyzing your task...</Text>
        </View>
      )}

      {!loading && searched && recommendations.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Text variant="titleMedium" style={styles.noResultsText}>
            No models found for your task.
          </Text>
          <Text variant="bodyMedium" style={styles.noResultsSubtext}>
            Try a different description or adjust your task details.
          </Text>
        </View>
      )}

      {recommendations.length > 0 && (
        <>
          <Divider style={styles.divider} />
          <Text variant="titleMedium" style={styles.resultsTitle}>
            Recommended Models
          </Text>
          {recommendations.map((rec, index) => (
            <ModelCard
              key={rec.model.id}
              recommendation={rec}
              rank={index + 1}
            />
          ))}
        </>
      )}
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
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  button: {
    paddingVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  divider: {
    marginVertical: 24,
  },
  resultsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    marginVertical: 24,
    padding: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  noResultsText: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#e65100',
  },
  noResultsSubtext: {
    color: '#ff9800',
    textAlign: 'center',
  },
});
