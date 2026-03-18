import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { getUserProgress, ChallengeHistory } from '../utils/storage';
import { calculateLevel } from '../utils/challenges';
import { BarChart } from 'react-native-chart-kit';

const ProfileScreen: React.FC = () => {
  const [totalXP, setTotalXP] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [challengeHistory, setChallengeHistory] = useState<ChallengeHistory[]>([]);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadProgress();
    const interval = setInterval(loadProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadProgress = async () => {
    const userProgress = await getUserProgress();
    setTotalXP(userProgress.totalXP);
    setCurrentStreak(userProgress.currentStreak);
    setChallengeHistory(userProgress.challengeHistory);

    const levelData = calculateLevel(userProgress.totalXP);
    setLevel(levelData.level);
    setProgress(levelData.progress);
  };

  const getXPByType = () => {
    const xpByType: { [key: string]: number } = {
      typing: 0,
      memory: 0,
      math: 0,
    };

    challengeHistory.forEach((challenge) => {
      if (xpByType[challenge.type] !== undefined) {
        xpByType[challenge.type] += challenge.xp;
      }
    });

    return xpByType;
  };

  const xpByType = getXPByType();
  const chartData = {
    labels: ['Typing', 'Memory', 'Math'],
    datasets: [
      {
        data: [xpByType.typing, xpByType.memory, xpByType.math],
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Level Progress</Text>
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.xpText}>{totalXP} XP</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress * 100)}% to next level</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Streak</Text>
        <View style={styles.streakContainer}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>days</Text>
        </View>
        <Text style={styles.streakMessage}>
          {currentStreak === 0 ? 'Complete a challenge to start your streak!' : 'Keep it up!'}
        </Text>
      </View>

      {challengeHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>XP by Challenge Type</Text>
          <BarChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" XP"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 8,
              },
              propsForLabels: {
                fontSize: 12,
              },
            }}
            style={styles.chart}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenge History</Text>
        {challengeHistory.length === 0 ? (
          <Text style={styles.emptyText}>No challenges completed yet. Start one to see your progress!</Text>
        ) : (
          challengeHistory.slice(0, 10).map((challenge, index) => (
            <View key={`${challenge.id}-${challenge.timestamp}`} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyTitle}>{challenge.title}</Text>
                <Text style={styles.historyDate}>
                  {new Date(challenge.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyScore}>Score: {challenge.score}</Text>
                <Text style={styles.historyXP}>+{challenge.xp} XP</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  xpText: {
    fontSize: 18,
    color: '#666',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  streakLabel: {
    fontSize: 18,
    color: '#666',
  },
  streakMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyLeft: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyScore: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  historyXP: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 24,
  },
});

export default ProfileScreen;
