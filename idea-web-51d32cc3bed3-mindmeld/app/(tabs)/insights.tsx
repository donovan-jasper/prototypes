import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useReminders } from '../../store/reminders';
import { useHabits } from '../../store/habits';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, getHours } from 'date-fns';
import { analyzePatterns } from '../../lib/ml-engine';
import SmartSuggestion from '../../components/SmartSuggestion';

const screenWidth = Dimensions.get('window').width;

interface TimePattern {
  hour: number;
  count: number;
  completionRate: number;
}

interface TaskPattern {
  title: string;
  count: number;
  completionRate: number;
}

export default function InsightsScreen() {
  const { reminders } = useReminders();
  const { habits } = useHabits();
  const [completionRate, setCompletionRate] = useState(0);
  const [timePatterns, setTimePatterns] = useState<TimePattern[]>([]);
  const [taskPatterns, setTaskPatterns] = useState<TaskPattern[]>([]);
  const [weeklyCompletion, setWeeklyCompletion] = useState<{ date: string; completed: number; total: number }[]>([]);
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([]);

  useEffect(() => {
    // Calculate completion rate
    const completedReminders = reminders.filter(r => r.completed).length;
    const totalReminders = reminders.length;
    setCompletionRate(totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0);

    // Calculate time patterns
    const timeCounts: Record<number, { completed: number; total: number }> = {};

    reminders.forEach(reminder => {
      const date = parseISO(reminder.date);
      const hour = date.getHours();

      if (!timeCounts[hour]) {
        timeCounts[hour] = { completed: 0, total: 0 };
      }

      timeCounts[hour].total += 1;
      if (reminder.completed) {
        timeCounts[hour].completed += 1;
      }
    });

    const sortedTimes = Object.entries(timeCounts)
      .map(([hour, counts]) => ({
        hour: parseInt(hour),
        count: counts.total,
        completionRate: counts.total > 0 ? (counts.completed / counts.total) * 100 : 0
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3);

    setTimePatterns(sortedTimes);

    // Calculate task patterns
    const taskCounts: Record<string, { completed: number; total: number }> = {};

    reminders.forEach(reminder => {
      if (!taskCounts[reminder.title]) {
        taskCounts[reminder.title] = { completed: 0, total: 0 };
      }

      taskCounts[reminder.title].total += 1;
      if (reminder.completed) {
        taskCounts[reminder.title].completed += 1;
      }
    });

    const sortedTasks = Object.entries(taskCounts)
      .map(([title, counts]) => ({
        title,
        count: counts.total,
        completionRate: counts.total > 0 ? (counts.completed / counts.total) * 100 : 0
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3);

    setTaskPatterns(sortedTasks);

    // Calculate weekly completion
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weeklyData = daysInWeek.map(day => {
      const dayReminders = reminders.filter(r => isSameDay(parseISO(r.date), day));
      const completed = dayReminders.filter(r => r.completed).length;
      const total = dayReminders.length;

      return {
        date: format(day, 'EEE'),
        completed,
        total
      };
    });

    setWeeklyCompletion(weeklyData);

    // Analyze patterns for suggested times
    const patterns = analyzePatterns(reminders);
    setSuggestedTimes(patterns.suggestions);
  }, [reminders]);

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const handleAcceptSuggestion = (suggestion: string) => {
    // In a real app, this would add the suggestion as a new reminder
    console.log('Accepted suggestion:', suggestion);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weekly Insights</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Completion Rate</Text>
        <Text style={styles.completionRate}>{completionRate.toFixed(0)}%</Text>
        <Text style={styles.completionText}>
          {reminders.filter(r => r.completed).length} of {reminders.length} tasks completed
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Suggested Times</Text>
        {suggestedTimes.length > 0 ? (
          suggestedTimes.map((suggestion, index) => (
            <SmartSuggestion
              key={index}
              suggestion={suggestion}
              onAccept={() => handleAcceptSuggestion(suggestion)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No suggestions yet. Complete more tasks to see patterns.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Completion</Text>
        <LineChart
          data={{
            labels: weeklyCompletion.map(item => item.date),
            datasets: [
              {
                data: weeklyCompletion.map(item => item.completed),
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                strokeWidth: 2
              }
            ],
            legend: ['Completed Tasks']
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Best Times for Tasks</Text>
        <BarChart
          data={{
            labels: timePatterns.map(item => `${item.hour}:00`),
            datasets: [
              {
                data: timePatterns.map(item => item.completionRate)
              }
            ]
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Most Consistent Tasks</Text>
        {taskPatterns.length > 0 ? (
          <PieChart
            data={taskPatterns.map((task, index) => ({
              name: task.title,
              population: task.completionRate,
              color: `hsl(${(index * 120) % 360}, 70%, 50%)`,
              legendFontColor: '#7F7F7F',
              legendFontSize: 12,
            }))}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        ) : (
          <Text style={styles.emptyText}>No task patterns yet</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Habit Progress</Text>
        {habits.length > 0 ? (
          <View style={styles.habitList}>
            {habits.map(habit => (
              <View key={habit.id} style={styles.habitItem}>
                <Text style={styles.habitTitle}>{habit.title}</Text>
                <Text style={styles.habitStreak}>{habit.streak} day streak</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No habits yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  completionRate: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    marginVertical: 10,
  },
  completionText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
  habitList: {
    marginTop: 10,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  habitTitle: {
    fontSize: 16,
  },
  habitStreak: {
    fontSize: 14,
    color: '#666',
  },
});
