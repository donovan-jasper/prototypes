import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFriends } from '../../hooks/useFriends';
import { getAnalyticsSummary, getFriendsNeedingAttention, getLongestStreaks } from '../../lib/analytics';
import { calculateStreaks } from '../../lib/streaks';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { FriendCard } from '../../components/FriendCard';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const { friends } = useFriends();
  const [summary, setSummary] = useState(null);
  const [friendsNeedingAttention, setFriendsNeedingAttention] = useState([]);
  const [longestStreaks, setLongestStreaks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, attentionData, streaksData] = await Promise.all([
          getAnalyticsSummary(friends),
          getFriendsNeedingAttention(friends),
          getLongestStreaks(friends)
        ]);

        setSummary(summaryData);
        setFriendsNeedingAttention(attentionData);
        setLongestStreaks(streaksData);
      } catch (error) {
        console.error('Error loading insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [friends]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Your Friendship Stats</Text>

        <View style={styles.summaryCards}>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{summary?.totalFriends || 0}</Text>
            <Text style={styles.cardLabel}>Friends</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardValue}>{summary?.averageStreak || 0}</Text>
            <Text style={styles.cardLabel}>Avg Streak</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardValue}>{summary?.interactionsThisMonth || 0}</Text>
            <Text style={styles.cardLabel}>This Month</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Interaction Trends</Text>
        <LineChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                data: [20, 45, 28, 80, 99, 43],
                color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
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
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#FF6B6B'
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>

      {friendsNeedingAttention.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends Needing Attention</Text>
          {friendsNeedingAttention.map(friend => (
            <FriendCard
              key={friend.id}
              friend={friend}
              showScore
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Longest Streaks</Text>
        {longestStreaks.map(friend => (
          <FriendCard
            key={friend.id}
            friend={friend}
            showStreak
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  chartSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFE6E6',
    borderRadius: 12,
    padding: 16,
    width: '30%',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
