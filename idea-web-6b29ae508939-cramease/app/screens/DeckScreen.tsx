import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getDeckStats } from '../utils/spacedRepetition';
import { useNavigation } from '@react-navigation/native';

const DeckScreen = ({ route }) => {
  const { deckId, deckName } = route.params;
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalCards: 0,
    dueCards: 0,
    averageRecallStrength: 0.5,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const deckStats = await getDeckStats(db, deckId);
        setStats(deckStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading deck stats:', error);
        setIsLoading(false);
      }
    };

    loadStats();
  }, [deckId]);

  const handleStartReview = () => {
    navigation.navigate('Flashcard', { deckId });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.deckName}>{deckName}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalCards}</Text>
          <Text style={styles.statLabel}>Total Cards</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.dueCards}</Text>
          <Text style={styles.statLabel}>Due Today</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{(stats.averageRecallStrength * 100).toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Avg Recall</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.reviewButton}
        onPress={handleStartReview}
        disabled={stats.dueCards === 0}
      >
        <Text style={styles.reviewButtonText}>
          {stats.dueCards > 0 ? `Review ${stats.dueCards} Cards` : 'No Cards Due'}
        </Text>
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Mastery Progress</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${stats.averageRecallStrength * 100}%` }]} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  deckName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  reviewButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ecdc4',
    borderRadius: 5,
  },
});

export default DeckScreen;
