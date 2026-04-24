import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useFriends, useInteractions } from '../../hooks';
import { PremiumGate } from '../../components/PremiumGate';
import { usePremium } from '../../hooks/usePremium';
import { calculateConnectionScore, getConnectionStatus } from '../../lib/scoring';
import { Friend } from '../../types';

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

  useEffect(() => {
    if (friends.length > 0) {
      calculateMonthlyStats();
      calculateInteractionTrends();
      identifyAtRiskFriends();
      generatePersonalizedSuggestions();
    }
  }, [friends, interactions]);

  const calculateMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthInteractions = interactions.filter(interaction => {
      const interactionDate = new Date(interaction.date);
      return (
        interactionDate.getMonth() === currentMonth &&
        interactionDate.getFullYear() === currentYear
      );
    });

    const lastMonthInteractions = interactions.filter(interaction => {
      const interactionDate = new Date(interaction.date);
      return (
        interactionDate.getMonth() === lastMonth &&
        interactionDate.getFullYear() === lastMonthYear
      );
    });

    const uniqueCurrentMonthFriends = new Set(
      currentMonthInteractions.map(i => i.friendId)
    ).size;

    const uniqueLastMonthFriends = new Set(
      lastMonthInteractions.map(i => i.friendId)
    ).size;

    const trend = uniqueCurrentMonthFriends - uniqueLastMonthFriends;

    setMonthlyStats({
      totalConnections: uniqueCurrentMonthFriends,
      lastMonthConnections: uniqueLastMonthFriends,
      trend
    });
  };

  const calculateInteractionTrends = () => {
    const now = new Date();
    const dataPoints = [];

    // Calculate for last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = now.getMonth() - i;
      const year = month < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const adjustedMonth = month < 0 ? 12 + month : month;

      const monthInteractions = interactions.filter(interaction => {
        const interactionDate = new Date(interaction.date);
        return (
          interactionDate.getMonth() === adjustedMonth &&
          interactionDate.getFullYear() === year
        );
      });

      const uniqueFriends = new Set(monthInteractions.map(i => i.friendId)).size;
      dataPoints.push(uniqueFriends);
    }

    setInteractionData(dataPoints);
  };

  const identifyAtRiskFriends = () => {
    const now = new Date();
    const riskFriends = friends.filter(friend => {
      if (!friend.lastContact) return true;

      const lastContactDate = new Date(friend.lastContact);
      const daysSince = Math.floor(
        (now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Friends with score below 40 or haven't been contacted in 30+ days
      return calculateConnectionScore(friend.lastContact) < 40 || daysSince > 30;
    });

    setAtRiskFriends(riskFriends);
  };

  const generatePersonalizedSuggestions = () => {
    const suggestions = [];

    // Find friends not contacted in 6+ months
    const longTimeFriends = friends.filter(friend => {
      if (!friend.lastContact) return true;

      const lastContactDate = new Date(friend.lastContact);
      const daysSince = Math.floor(
        (new Date().getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
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
        description="Get weekly reports on your connection trends, at-risk friendships, and personalized suggestions to strengthen your relationships."
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Connections</Text>
        <Text style={styles.summaryValue}>{monthlyStats.totalConnections}</Text>
        <Text style={styles.summaryComparison}>
          {monthlyStats.trend > 0 ? '+' : ''}{monthlyStats.trend} from last month
        </Text>
      </View>

      {/* Interaction Trend Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Interaction Trends</Text>
        <LineChart
          data={{
            labels: ['-5m', '-4m', '-3m', '-2m', '-1m', 'This month'],
            datasets: [
              {
                data: interactionData,
              },
            ],
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
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#4CAF50',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      {/* At-Risk Friendships */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>At-Risk Friendships</Text>
        {atRiskFriends.length > 0 ? (
          atRiskFriends.map(friend => (
            <View key={friend.id} style={styles.friendItem}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendAction}>
                {friend.lastContact
                  ? `Last contacted ${Math.floor(
                      (new Date().getTime() - new Date(friend.lastContact).getTime()) /
                      (1000 * 60 * 60 * 24)
                    )} days ago`
                  : 'Never contacted'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No at-risk friendships detected</Text>
        )}
      </View>

      {/* Personalized Suggestions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personalized Suggestions</Text>
        {personalizedSuggestions.length > 0 ? (
          personalizedSuggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No personalized suggestions at this time</Text>
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
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  summaryComparison: {
    fontSize: 14,
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
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  section: {
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
    marginBottom: 12,
  },
  friendItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  friendAction: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  suggestionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
  },
  noData: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default InsightsScreen;
