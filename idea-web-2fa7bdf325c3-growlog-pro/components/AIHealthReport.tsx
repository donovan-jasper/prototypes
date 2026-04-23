import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AIHealthReportProps {
  analysis: string;
  healthScore: number;
  issues: string[];
}

export default function AIHealthReport({ analysis, healthScore, issues }: AIHealthReportProps) {
  const getHealthColor = () => {
    if (healthScore >= 80) return '#4CAF50'; // Green
    if (healthScore >= 60) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Health Analysis</Text>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Health Score:</Text>
        <View style={styles.scoreBar}>
          <View
            style={[
              styles.scoreFill,
              { width: `${healthScore}%`, backgroundColor: getHealthColor() }
            ]}
          />
          <Text style={styles.scoreValue}>{healthScore}/100</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analysis</Text>
        <Text style={styles.analysisText}>{analysis}</Text>
      </View>

      {issues.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identified Issues</Text>
          {issues.map((issue, index) => (
            <View key={index} style={styles.issueItem}>
              <Text style={styles.bullet}>•</Text>
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
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  scoreContainer: {
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 10,
  },
  scoreValue: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    lineHeight: 20,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
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
  issueItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    marginRight: 8,
    fontSize: 16,
    color: '#F44336',
  },
  issueText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
});
