import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const BehaviorInsight = ({ match, detailed = false }) => {
  const insights = match.compatibilityInsights || [];

  return (
    <View style={styles.container}>
      {insights.map((insight, index) => (
        <View key={index} style={styles.insightItem}>
          <Ionicons
            name={insight.icon}
            size={24}
            color={Colors.primary}
            style={styles.icon}
          />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
            {detailed && insight.details && (
              <Text style={styles.insightDetails}>{insight.details}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 15,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 5,
  },
  insightDetails: {
    fontSize: 12,
    color: Colors.text,
    fontStyle: 'italic',
  },
});

export default BehaviorInsight;
