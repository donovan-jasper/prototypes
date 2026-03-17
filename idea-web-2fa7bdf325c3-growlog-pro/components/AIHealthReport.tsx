import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AIHealthReportProps {
  analysis: string;
  healthScore: number;
  issues: string[];
}

export default function AIHealthReport({ analysis, healthScore, issues }: AIHealthReportProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.healthScoreContainer}>
        <Text style={styles.healthScoreLabel}>Health Score</Text>
        <Text style={[
          styles.healthScoreValue,
          healthScore < 50 ? styles.badScore :
          healthScore < 80 ? styles.mediumScore :
          styles.goodScore
        ]}>
          {healthScore}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analysis</Text>
        <Text style={styles.analysisText}>{analysis}</Text>
      </View>

      {issues.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Potential Issues</Text>
          {issues.map((issue, index) => (
            <View key={index} style={styles.issueItem}>
              <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
              <Text style={styles.issueText}>{issue}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  healthScoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  healthScoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  healthScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  goodScore: {
    color: '#4CAF50',
  },
  mediumScore: {
    color: '#FFC107',
  },
  badScore: {
    color: '#F44336',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueText: {
    marginLeft: 8,
    fontSize: 16,
  },
});
