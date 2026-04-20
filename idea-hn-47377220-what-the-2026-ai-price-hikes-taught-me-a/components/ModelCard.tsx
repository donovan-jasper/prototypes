import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { ModelRecommendation } from '../types/models';
import { calculateSavings } from '../services/costCalculator';
import { getAIRecommendation } from '../services/aiService';

interface Props {
  recommendation: ModelRecommendation;
  rank: number;
  onSelect?: (modelId: string) => void;
  currentModelId?: string;
  taskDescription?: string;
}

export default function ModelCard({ recommendation, rank, onSelect, currentModelId, taskDescription }: Props) {
  const { model, costEstimate, reasoning } = recommendation;
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (taskDescription && rank === 1) {
      generateAIExplanation();
    }
  }, [taskDescription]);

  const generateAIExplanation = async () => {
    if (!taskDescription) return;

    setIsLoading(true);
    try {
      const explanation = await getAIRecommendation(taskDescription, [recommendation]);
      setAiExplanation(explanation);
    } catch (error) {
      console.error('Failed to generate AI explanation:', error);
      setAiExplanation('This model offers the best balance of cost and quality for your task.');
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeColor = () => {
    if (rank === 1) return '#4CAF50';
    if (rank === 2) return '#2196F3';
    return '#FF9800';
  };

  const isCurrentModel = currentModelId === model.id;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text variant="titleMedium" style={styles.modelName}>
              {model.name}
            </Text>
            <Chip
              style={[styles.badge, { backgroundColor: getBadgeColor() }]}
              textStyle={styles.badgeText}
            >
              #{rank}
            </Chip>
          </View>
          <Text variant="bodySmall" style={styles.provider}>
            {model.provider}
          </Text>
        </View>

        <View style={styles.costRow}>
          <Text variant="headlineSmall" style={styles.cost}>
            ${costEstimate.toFixed(4)}
          </Text>
          <Text variant="bodySmall" style={styles.perTask}>
            per task
          </Text>
        </View>

        {rank === 1 && taskDescription && (
          <View style={styles.aiExplanationContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <>
                <Text variant="titleSmall" style={styles.aiTitle}>AI Explanation:</Text>
                <Text variant="bodyMedium" style={styles.aiText}>
                  {aiExplanation || reasoning}
                </Text>
              </>
            )}
          </View>
        )}

        <View style={styles.specs}>
          <Chip icon="speedometer" style={styles.specChip}>
            {model.speedRating}
          </Chip>
          <Chip icon="star" style={styles.specChip}>
            Quality: {model.qualityScore}/100
          </Chip>
        </View>

        {onSelect && (
          <Button
            mode={isCurrentModel ? 'outlined' : 'contained'}
            onPress={() => onSelect(model.id)}
            style={styles.selectButton}
            icon={isCurrentModel ? 'check' : 'arrow-right'}
          >
            {isCurrentModel ? 'Current Model' : 'Select Model'}
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modelName: {
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  provider: {
    color: '#666',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  cost: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 4,
  },
  perTask: {
    color: '#666',
  },
  aiExplanationContainer: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  aiTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2e7d32',
  },
  aiText: {
    lineHeight: 20,
  },
  specs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  specChip: {
    height: 28,
  },
  selectButton: {
    marginTop: 16,
  },
});
