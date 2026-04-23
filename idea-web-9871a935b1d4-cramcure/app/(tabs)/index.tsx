import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useDatabase } from '../../hooks/useDatabase';
import { useCycleData } from '../../hooks/useCycleData';
import { format, differenceInDays } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';
import SOSButton from '../../components/SOSButton';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { getRecentSymptoms, getFavoriteExercises } = useDatabase();
  const { currentCycle, nextPeriodPrediction } = useCycleData();
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
            <TouchableOpacity style={styles.actionButton} onPress={navigateToTrack}>
              <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
                <MaterialCommunityIcons name="calendar-plus" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.actionText}>Log Symptoms</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={navigateToRelief}>
              <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
                <MaterialCommunityIcons name="meditation" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Relief Exercises</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={navigateToInsights}>
              <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                <MaterialCommunityIcons name="chart-line" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionText}>View Insights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Favorite Exercises */}
        {favoriteExercises.length > 0 && (
          <View style={styles.favoritesContainer}>
            <Text style={styles.sectionTitle}>Favorite Exercises</Text>
            <View style={styles.exerciseList}>
              {favoriteExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseItem}
                  onPress={() => navigateToExercise(exercise.id)}
                >
                  <View style={styles.exerciseIcon}>
                    <MaterialCommunityIcons
                      name={exercise.icon || 'yoga'}
                      size={24}
                      color="#8B5CF6"
                    />
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    <Text style={styles.exerciseDuration}>
                      {exercise.duration} min • {exercise.difficulty}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* SOS Button */}
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
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
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
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
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
    marginBottom: 15,
  },
  quickActions: {
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
  favoritesContainer: {
    marginBottom: 20,
  },
  exerciseList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default HomeScreen;
