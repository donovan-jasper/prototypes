import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getDecisions } from '../utils/storage';
import { Decision } from '../types/Decision';

const DecisionTracker: React.FC = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDecisions = async () => {
      try {
        const data = await getDecisions();
        setDecisions(data);
      } catch (error) {
        console.error('Failed to load decisions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDecisions();
  }, []);

  const renderItem = ({ item }: { item: Decision }) => {
    const percentageError = ((Math.abs(item.actualValue - item.estimatedValue) / item.actualValue) * 100).toFixed(1);
    const isAccurate = percentageError <= 20;

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.valuesContainer}>
          <Text style={styles.value}>Actual: {item.actualValue}</Text>
          <Text style={styles.value}>Estimated: {item.estimatedValue}</Text>
          <Text style={[styles.error, isAccurate ? styles.accurate : styles.inaccurate]}>
            Error: {percentageError}%
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading decisions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Decision History</Text>
      {decisions.length === 0 ? (
        <Text style={styles.empty}>No decisions recorded yet. Complete the daily quiz!</Text>
      ) : (
        <FlatList
          data={decisions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  valuesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
  },
  error: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  accurate: {
    color: '#4CAF50',
  },
  inaccurate: {
    color: '#F44336',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});

export default DecisionTracker;
