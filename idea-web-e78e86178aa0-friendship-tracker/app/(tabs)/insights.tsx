import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useFriends, useInteractions } from '../../hooks';
import { PremiumGate } from '../../components/PremiumGate';
import { usePremium } from '../../hooks/usePremium';
import { calculateConnectionScore, getConnectionStatus } from '../../lib/scoring';
import { Friend } from '../../types';
import { MaterialIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const InsightsScreen = () => {
  const { friends } = useFriends();
  const { interactions } = useInteractions();
  const { isPremium } = usePremium();
  const [monthlyStats, setMonthlyStats] = useState({
    totalConnections: 0,
    lastMonthConnections: 0,
    trend: 0
  });
  const [interactionData, setInteractionData] = useState<number[]>([]);
  const [atRiskFriends, setAtRiskFriends] = useState<Friend[]>([]);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    if (friends.length > 0) {
      calculateStats();
      calculateInteractionTrends();
      identifyAtRiskFriends();
      generatePersonalizedSuggestions();
    }
  }, [friends, interactions, timePeriod]);

  const calculateStats = () => {
    const now = new Date();
    const currentPeriod = timePeriod === 'week' ? 7 : 30;
    const previousPeriod = currentPeriod * 2;

    const currentPeriodInteractions = interactions.filter(interaction => {
      const interactionDate = new Date(interaction.date);
      const daysDiff = Math.floor((now.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= currentPeriod;
    });

    const previousPeriodInteractions = interactions.filter(interaction => {
      const interactionDate = new Date(interaction.date);
      const daysDiff = Math.floor((now.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > currentPeriod && daysDiff <= previousPeriod;
    });

    const uniqueCurrentPeriodFriends = new Set(
      currentPeriodInteractions.map(i => i.friendId)
    ).size;

    const uniquePreviousPeriodFriends = new Set(
      previousPeriodInteractions.map(i => i.friendId)
    ).size;

    const trend = uniqueCurrentPeriodFriends - uniquePreviousPeriodFriends;

    setMonthlyStats({
      totalConnections: uniqueCurrentPeriodFriends,
      lastMonthConnections: uniquePreviousPeriodFriends,
      trend
    });
  };

  const calculateInteractionTrends = () => {
    const now = new Date();
    const dataPoints = [];
    const labels = [];

    const periodCount = timePeriod === 'week' ? 7 : 30;

    for (let i = periodCount - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const dayInteractions = interactions.filter(interaction => {
        const interactionDate = new Date(interaction.date);
        return (
          interactionDate.getDate() === date.getDate() &&
          interactionDate.getMonth() === date.getMonth() &&
          interactionDate.getFullYear() === date.getFullYear()
        );
      });

      const uniqueFriends = new Set(dayInteractions.map(i => i.friendId)).size;
      dataPoints.push(uniqueFriends);

      if (timePeriod === 'week') {
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      } else {
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
    }

    setInteractionData(dataPoints);
  };

  const identifyAtRiskFriends = () => {
    const now = new Date();
    const riskThreshold = timePeriod === 'week' ? 30 : 90; // 30 days for week, 90 for month

    const riskFriends = friends.filter(friend => {
      if (!friend.lastContact) return true;

      const lastContactDate = new Date(friend.lastContact);
      const daysSince = Math.floor(
        (now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSince > riskThreshold;
    });

    setAtRiskFriends(riskFriends);
  };

  const generatePersonalizedSuggestions = () => {
    const suggestions = [];
    const now = new Date();

    // Find friends not contacted in 6+ months
    const longTimeFriends = friends.filter(friend => {
      if (!friend.lastContact) return true;

      const lastContactDate = new Date(friend.lastContact);
      const daysSince = Math.floor(
        (now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSince > 180; // 6 months
    });

    if (longTimeFriends.length > 0) {
      suggestions.push(
        `You haven't seen ${longTimeFriends.length > 1 ? 'these friends' : 'this friend'} in 6+ months — plan a reunion?`
      );
    }

    // Find friends with declining connection scores
    const decliningFriends = friends.filter(friend => {
      if (!friend.lastContact) return false;

      const score = calculateConnectionScore(friend.lastContact);
      return score < 50 && getConnectionStatus(score) === 'neglecting';
    });

    if (decliningFriends.length > 0) {
      suggestions.push(
        `Your connection with ${decliningFriends.length > 1 ? 'some friends' : 'a friend'} is declining. Consider reaching out soon.`
      );
    }

    setPersonalizedSuggestions(suggestions);
  };

  if (!isPremium) {
    return (
      <PremiumGate
        featureName="Friendship Insights"
        description="Get weekly/monthly reports on your connection trends, at-risk friendships, and personalized suggestions to strengthen your relationships."
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, timePeriod === 'week' && styles.activePeriod]}
          onPress={() => setTimePeriod('week')}
        >
          <Text style={styles.periodButtonText}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, timePeriod === 'month' && styles.activePeriod]}
          onPress={() => setTimePeriod('month')}
        >
          <Text style={styles.periodButtonText}>Month</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Connection Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monthlyStats.totalConnections}</Text>
            <Text style={styles.statLabel}>Friends Connected</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {monthlyStats.trend > 0 ? `+${monthlyStats.trend}` : monthlyStats.trend}
            </Text>
            <Text style={styles.statLabel}>vs. Previous {timePeriod}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Connection Trends</Text>
        <LineChart
          data={{
            labels: Array.from({ length: timePeriod === 'week' ? 7 : 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (timePeriod === 'week' ? 6 - i : 29 - i));
              return timePeriod === 'week'
                ? date.toLocaleDateString('en-US', { weekday: 'short' })
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            datasets: [
              {
                data: interactionData,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                strokeWidth: 2
              }
            ]
          }}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#4CAF50'
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>

      <View style={styles.atRiskSection}>
        <Text style={styles.sectionTitle}>At-Risk Friendships</Text>
        {atRiskFriends.length > 0 ? (
          atRiskFriends.map(friend => (
            <View key={friend.id} style={styles.friendItem}>
              <MaterialIcons name="warning" size={20} color="#F44336" />
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendStatus}>
                Last contacted {friend.lastContact ? new Date(friend.lastContact).toLocaleDateString() : 'never'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noRiskText}>No at-risk friendships detected!</Text>
        )}
      </View>

      <View style={styles.suggestionsSection}>
        <Text style={styles.sectionTitle}>Personalized Suggestions</Text>
        {personalizedSuggestions.length > 0 ? (
          personalizedSuggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <MaterialIcons name="lightbulb-outline" size={20} color="#FFC107" />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSuggestionsText}>Your relationships are looking strong!</Text>
        )}
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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activePeriod: {
    backgroundColor: '#4CAF50',
  },
  periodButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  atRiskSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendName: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  friendStatus: {
    fontSize: 12,
    color: '#666',
  },
  noRiskText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 16,
  },
  suggestionsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    color: '#333',
  },
  noSuggestionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default InsightsScreen;
