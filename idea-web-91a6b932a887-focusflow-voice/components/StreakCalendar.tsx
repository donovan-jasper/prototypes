import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { getStreak } from '../lib/database';

interface StreakCalendarProps {
  currentStreak: number;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ currentStreak }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedDates, setCompletedDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        // In a real app, you would fetch all completed dates from the database
        // For this example, we'll simulate it with the current streak
        const days = [];
        const today = new Date();

        for (let i = 0; i < currentStreak; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          days.push(format(date, 'yyyy-MM-dd'));
        }

        setCompletedDates(days);
      } catch (error) {
        console.error('Failed to fetch streak data', error);
      }
    };

    fetchStreakData();
  }, [currentStreak]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.navButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentDate, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={styles.navButton}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {daysInMonth.map((day) => {
          const dateString = format(day, 'yyyy-MM-dd');
          const isCompleted = completedDates.includes(dateString);
          const isToday = isSameDay(day, new Date());

          return (
            <View
              key={dateString}
              style={[
                styles.dayContainer,
                !isSameMonth(day, currentDate) && styles.otherMonthDay,
              ]}
            >
              <View
                style={[
                  styles.dayCircle,
                  isCompleted && styles.completedDay,
                  isToday && styles.todayDay,
                ]}
              />
              <Text style={styles.dayText}>{format(day, 'd')}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.streakInfo}>
        <Text style={styles.streakText}>Current Streak: {currentStreak} days</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    fontSize: 24,
    paddingHorizontal: 12,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDay: {
    fontSize: 12,
    color: '#666',
    width: 30,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayContainer: {
    width: '14.2857%', // 7 days in a week
    alignItems: 'center',
    marginBottom: 8,
  },
  otherMonthDay: {
    opacity: 0.4,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedDay: {
    backgroundColor: '#4CAF50',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  dayText: {
    fontSize: 12,
  },
  streakInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default StreakCalendar;
