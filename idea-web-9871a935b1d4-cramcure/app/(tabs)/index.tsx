import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useDatabase } from '../../hooks/useDatabase';
import { useCycleData } from '../../hooks/useCycleData';
import { format, differenceInDays } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';
import SOSButton from '../../components/SOSButton';
import CycleCalendar from '../../components/CycleCalendar';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { db, getRecentSymptoms, getFavoriteExercises } = useDatabase();
  const { currentCycle, nextPeriodPrediction, ovulationDate, patternAnalysis } = useCycleData();
  const [recentSymptoms, setRecentSymptoms] = useState([]);
  const [favoriteExercises, setFavoriteExercises] = useState([]);
  const [painChartData, setPainChartData] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });

  useEffect(() => {
    const loadData = async () => {
      // Load recent symptoms
      const symptoms = await getRecentSymptoms(7);
      setRecentSymptoms(symptoms);

      // Load favorite exercises
      const exercises = await getFavoriteExercises();
      setFavoriteExercises(exercises.slice(0, 3));

      // Prepare chart data
      if (symptoms.length > 0) {
        const labels = symptoms.map(s => format(new Date(s.date), 'MMM d'));
        const data = symptoms.map(s => s.painLevel);

        setPainChartData({
          labels,
          datasets: [{ data }]
        });
      }
    };

    loadData();
  }, []);

  const daysUntilPeriod = nextPeriodPrediction
    ? differenceInDays(new Date(nextPeriodPrediction), new Date())
    : null;

  const currentCycleDay = currentCycle?.startDate
    ? differenceInDays(new Date(), new Date(currentCycle.startDate)) + 1
    : null;

  const navigateToTrack = () => {
    navigation.navigate('track');
  };

  const navigateToExercise = (id) => {
    navigation.navigate('exercise/[id]', { id });
  };

  const navigateToRelief = () => {
    navigation.navigate('relief');
  };

  const navigateToInsights = () => {
    navigation.navigate('insights');
  };

  const getTrendIcon = () => {
    if (!patternAnalysis) return null;

    switch (patternAnalysis.recentTrend) {
      case 'increasing':
        return <MaterialIcons name="trending-up" size={20} color="#EF4444" />;
      case 'decreasing':
        return <MaterialIcons name="trending-down" size={20} color="#10B981" />;
      case 'stable':
        return <MaterialIcons name="trending-flat" size={20} color="#3B82F6" />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, User</Text>
          <Text style={styles.subtitle}>Here's your menstrual health overview</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialCommunityIcons name="calendar-range" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Current Cycle Day</Text>
              <Text style={styles.statValue}>
                {currentCycleDay ? `${currentCycleDay}` : '--'}
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Days Until Period</Text>
              <Text style={styles.statValue}>
                {daysUntilPeriod ? `${daysUntilPeriod}` : '--'}
              </Text>
            </View>
          </View>

          {patternAnalysis && (
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="chart-line" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Cycle Trend</Text>
                <View style={styles.trendContainer}>
                  {getTrendIcon()}
                  <Text style={styles.trendText}>
                    {patternAnalysis.recentTrend === 'unknown' ? 'No data' : patternAnalysis.recentTrend}
                  </Text>
                </View>
                <Text style={styles.confidenceText}>
                  Confidence: {Math.round(patternAnalysis.confidence * 100)}%
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Pain Chart */}
        {recentSymptoms.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Recent Pain Levels</Text>
            <LineChart
              data={painChartData}
              width={width - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#8B5CF6',
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToTrack}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#8B5CF6" />
              <Text style={styles.actionButtonText}>Log Symptom</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToRelief}
            >
              <MaterialCommunityIcons name="yoga" size={24} color="#8B5CF6" />
              <Text style={styles.actionButtonText}>Relief Exercises</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToInsights}
            >
              <MaterialCommunityIcons name="chart-line" size={24} color="#8B5CF6" />
              <Text style={styles.actionButtonText}>View Insights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Favorite Exercises */}
        {favoriteExercises.length > 0 && (
          <View style={styles.favoritesContainer}>
            <Text style={styles.sectionTitle}>Favorite Exercises</Text>
            <View style={styles.favoriteList}>
              {favoriteExercises.map(exercise => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.favoriteItem}
                  onPress={() => navigateToExercise(exercise.id)}
                >
                  <MaterialCommunityIcons name="yoga" size={24} color="#8B5CF6" />
                  <Text style={styles.favoriteText}>{exercise.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>Cycle Calendar</Text>
          <CycleCalendar
            db={db}
            predictedPeriodStart={nextPeriodPrediction}
            ovulationDate={ovulationDate}
          />
        </View>
      </ScrollView>

      <SOSButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  confidenceText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  favoritesContainer: {
    marginBottom: 24,
  },
  favoriteList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  favoriteItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default HomeScreen;
