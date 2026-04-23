import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface AIHealthReportProps {
  analysis: string;
  healthScore: number;
  issues: string[];
  isLoading: boolean;
}

export default function AIHealthReport({ analysis, healthScore, issues, isLoading }: AIHealthReportProps) {
  const getHealthColor = () => {
    if (healthScore >= 80) return '#4CAF50';
    if (healthScore >= 60) return '#FFC107';
    if (healthScore >= 40) return '#FF9800';
    return '#F44336';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Analyzing your plant...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Health Analysis</Text>
        <View style={[styles.scoreContainer, { backgroundColor: getHealthColor() }]}>
          <Text style={styles.scoreText}>{healthScore}</Text>
        </View>
      </View>

      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>Analysis:</Text>
        <Text style={styles.analysisText}>{analysis}</Text>
      </View>

      {issues.length > 0 && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Detected Issues:</Text>
          {issues.map((issue, index) => (
            <View key={index} style={styles.issueItem}>
              <MaterialIcons name="warning" size={16} color="#F44336" />
              <Text style={styles.issueText}>{issue}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  analysisContainer: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  issuesContainer: {
    marginTop: 12,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#F44336',
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  issueText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
});
