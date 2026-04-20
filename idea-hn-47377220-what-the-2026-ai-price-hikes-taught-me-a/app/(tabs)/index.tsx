import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Divider } from 'react-native-paper';
import { TaskType } from '../../types/models';
import { matchModelsForTask } from '../../services/modelService';
import { estimateTokens } from '../../services/costCalculator';
import ModelCard from '../../components/ModelCard';
import { getAIRecommendation } from '../../services/aiService';

export default function HomeScreen() {
  const [taskDescription, setTaskDescription] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  const handleFindModels = async () => {
    if (!taskDescription.trim()) return;

    setLoading(true);
    setAiRecommendation(null);

    // Simple task type detection
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
      estimatedOutputTokens: estimatedTokens * 2, // Assume output is 2x input
    };

    const matches = matchModelsForTask(task);
    setRecommendations(matches);

    // Get AI recommendation for the top model
    if (matches.length > 0) {
      try {
        const aiRec = await getAIRecommendation(taskDescription, [matches[0]]);
        setAiRecommendation(aiRec);
      } catch (error) {
        console.error('Failed to get AI recommendation:', error);
        // Fallback to the default reasoning from the model
        setAiRecommendation(matches[0].reasoning);
      }
    }

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
          {loading ? 'Finding models...' : 'Find Models'}
        </Button>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analyzing your task...</Text>
        </View>
      )}

      {aiRecommendation && recommendations.length > 0 && (
        <View style={styles.aiRecommendation}>
          <Text variant="titleSmall" style={styles.aiTitle}>Top Recommendation:</Text>
          <Text variant="bodyMedium" style={styles.aiText}>{aiRecommendation}</Text>
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
              taskDescription={taskDescription}
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
  aiRecommendation: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  aiTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2e7d32',
  },
  aiText: {
    lineHeight: 20,
  },
  divider: {
    marginVertical: 24,
  },
  resultsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    marginHorizontal: 16,
  },
});
