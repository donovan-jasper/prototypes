import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ResultsScreen({ route, navigation }) {
  const { score } = route.params;
  const percentage = Math.round((score.correct / score.total) * 100);

  const getMessage = () => {
    if (percentage === 100) return 'Perfect! 🎉';
    if (percentage >= 67) return 'Great job! 🌟';
    if (percentage >= 33) return 'Good effort! 💪';
    return 'Keep practicing! 📚';
  };

  const getColor = () => {
    if (percentage === 100) return '#10b981';
    if (percentage >= 67) return '#6366f1';
    if (percentage >= 33) return '#f59e0b';
    return '#ef4444';
  };

  const getDifficultyMessage = () => {
    if (percentage >= 80) {
      return score.difficulty === 'hard'
        ? 'You\'re mastering the hardest challenges!'
        : 'Next time, try harder problems!';
    }
    if (percentage < 40) {
      return score.difficulty === 'easy'
        ? 'Keep practicing at this level'
        : 'We\'ll adjust the difficulty for you';
    }
    return 'You\'re progressing well!';
  };

  const getDomainColor = () => {
    switch (score.domain) {
      case 'logic':
        return '#4f46e5';
      case 'math':
        return '#0369a1';
      case 'verbal':
        return '#15803d';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <Text style={styles.title}>{getMessage()}</Text>

        <View style={[styles.scoreCircle, { borderColor: getColor() }]}>
          <Text style={[styles.scorePercentage, { color: getColor() }]}>
            {percentage}%
          </Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>

        <View style={styles.domainContainer}>
          <View style={[styles.domainBadge, { backgroundColor: `${getDomainColor()}20` }]}>
            <Text style={[styles.domainText, { color: getDomainColor() }]}>
              {score.domain.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyLabel}>Difficulty: {score.difficulty}</Text>
          <Text style={styles.adaptiveMessage}>{getDifficultyMessage()}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{score.correct}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{score.incorrect}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{score.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('DailyChallenges')}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 32,
  },
  scoreCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  scorePercentage: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  domainContainer: {
    marginBottom: 16,
  },
  domainBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  domainText: {
    fontSize: 12,
    fontWeight: '700',
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  adaptiveMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
