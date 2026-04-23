import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ProblemCard from '../components/ProblemCard';
import { getRandomProblems } from '../data/problems';
import { getProblemRecommendations, savePerformanceRecord } from '../hooks/useAdaptiveLogic';

export default function DailyChallengesScreen({ navigation }) {
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [currentDifficulty, setCurrentDifficulty] = useState('medium');
  const [currentDomain, setCurrentDomain] = useState('logic');
  const [loading, setLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    loadChallenges();
    setSessionStartTime(Date.now());
  }, []);

  const loadChallenges = async () => {
    try {
      const { domain, difficulty } = await getProblemRecommendations();
      setCurrentDomain(domain);
      setCurrentDifficulty(difficulty);
      setProblems(getRandomProblems(3, difficulty, domain));
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
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);

      await savePerformanceRecord(currentDifficulty, totalCorrect, totalProblems, currentDomain);

      setTimeout(() => {
        navigation.navigate('Results', {
          score: {
            correct: totalCorrect,
            incorrect: newScore.incorrect,
            total: totalProblems,
            difficulty: currentDifficulty,
            domain: currentDomain,
            duration: sessionDuration
          }
        });
      }, 1000);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  if (problems.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No problems available. Please try again later.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.progressContainer}>
        <View style={styles.domainBadge}>
          <Text style={styles.domainText}>{currentDomain.toUpperCase()}</Text>
        </View>
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
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  domainBadge: {
    alignSelf: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  domainText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369a1',
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
