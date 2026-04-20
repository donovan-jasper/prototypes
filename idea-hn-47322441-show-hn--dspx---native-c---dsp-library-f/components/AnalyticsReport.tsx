import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsReportProps {
  report: {
    generatedAt: number;
    insights: Array<{
      title: string;
      description: string;
      confidence: number;
    }>;
  };
}

const AnalyticsReport: React.FC<AnalyticsReportProps> = ({ report }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Report</Text>
        <Text style={styles.date}>Generated: {new Date(report.generatedAt).toLocaleString()}</Text>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: ['8 AM', '12 PM', '4 PM', '8 PM'],
            datasets: [
              {
                data: [22.5, 23.1, 22.8, 23.4],
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                strokeWidth: 2
              }
            ]
          }}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix="°C"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726'
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>

      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Key Insights</Text>

        {report.insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <View style={styles.confidenceContainer}>
                <Ionicons name="stats-chart" size={16} color="#666" />
                <Text style={styles.confidenceText}>{(insight.confidence * 100).toFixed(0)}%</Text>
              </View>
            </View>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  chartContainer: {
    marginBottom: 24,
  },
  insightsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});

export default AnalyticsReport;
