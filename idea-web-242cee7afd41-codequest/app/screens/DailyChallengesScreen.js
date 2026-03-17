import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ProblemCard from '../components/ProblemCard';
import { getRandomProblems } from '../data/problems';
import { getRecommendedDifficulty, savePerformanceRecord } from '../hooks/useAdaptiveLogic';

export default function DailyChallengesScreen({ navigation }) {
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [currentDifficulty, setCurrentDifficulty] = useState('easy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const difficulty = await getRecommendedDifficulty();
      setCurrentDifficulty(difficulty);
      setProblems(getRandomProblems(3, difficulty));
    } catch (error) {
      console.error('Error loading challenges:', error);
      setProblems(getRandomProblems(3));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (isCorrect) => {
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      incorrect: score.incorrect + (isCorrect ? 0 : 1)
    };
    
    setScore(newScore);

    if (currentProblemIndex < problems.length - 1) {
      setTimeout(() => {
        setCurrentProblemIndex(prev => prev + 1);
      }, 1000);
    } else {
      const totalCorrect = newScore.correct;
      const totalProblems = problems.length;
      
      await savePerformanceRecord(currentDifficulty, totalCorrect, totalProblems);
      
      setTimeout(() => {
        navigation.navigate('Results', {
          score: {
            correct: totalCorrect,
            incorrect: newScore.incorrect,
            total: totalProblems,
            difficulty: currentDifficulty
          }
        });
      }, 1000);
    }
  };

  if (loading || problems.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.progressContainer}>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{currentDifficulty.toUpperCase()}</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentProblemIndex + 1) / problems.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.scoreText}>
          Score: {score.correct} / {currentProblemIndex + 1}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProblemCard
          problem={problems[currentProblemIndex]}
          onAnswer={handleAnswer}
          problemNumber={currentProblemIndex + 1}
          totalProblems={problems.length}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  progressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  difficultyBadge: {
    alignSelf: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
});
