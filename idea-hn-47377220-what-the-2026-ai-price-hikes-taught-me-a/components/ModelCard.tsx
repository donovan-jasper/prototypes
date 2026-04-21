import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { ModelRecommendation } from '../types/models';

interface Props {
  recommendation: ModelRecommendation;
  rank: number;
}

export default function ModelCard({ recommendation, rank }: Props) {
  const { model, costEstimate, reasoning } = recommendation;

  const getBadgeColor = () => {
    if (rank === 1) return '#4CAF50'; 
    if (rank === 2) return '#2196F3'; 
    return '#FF9800'; 
  };

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

        <Text variant="bodyMedium" style={styles.reasoning}>
          {reasoning}
        </Text>

        <View style={styles.specs}>
          <Chip icon="speedometer" style={styles.specChip}>
            {model.speedRating}
          </Chip>
          <Chip icon="star" style={styles.specChip}>
            Quality: {model.qualityScore}/100
          </Chip>
          <Chip icon="book-open-variant" style={styles.specChip}>
            Context: {model.contextWindow / 1000}k
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
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
    color: '#333',
  },
  badge: {
    marginLeft: 8,
    borderRadius: 16,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  provider: {
    color: '#666',
    fontSize: 13,
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
    fontSize: 14,
  },
  reasoning: {
    marginBottom: 12,
    lineHeight: 20,
    color: '#444',
  },
  specs: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: 8, 
    marginTop: 8,
  },
  specChip: {
    height: 32, 
    backgroundColor: '#e0e0e0', 
    color: '#333',
  },
});
