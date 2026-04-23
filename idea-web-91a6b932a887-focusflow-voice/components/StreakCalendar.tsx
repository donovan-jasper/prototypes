import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { getStreak } from '../lib/database';

interface StreakCalendarProps {
  currentStreak: number;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ currentStreak }) => {
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        // In a real app, you would fetch all completed dates from the database
        // For this example, we'll simulate some data
        const mockDates = [
          '2023-11-01', '2023-11-02', '2023-11-03', '2023-11-05',
          '2023-11-06', '2023-11-07', '2023-11-08', '2023-11-10',
          '2023-11-11', '2023-11-12', '2023-11-13', '2023-11-15',
          '2023-11-16', '2023-11-17', '2023-11-18', '2023-11-20',
          '2023-11-21', '2023-11-22', '2023-11-23', '2023-11-25',
          '2023-11-26', '2023-11-27', '2023-11-28', '2023-11-30'
        ];

        setCompletedDates(mockDates);
      } catch (error) {
        console.error('Failed to fetch streak data', error);
      }
    };

    fetchStreakData();
  }, []);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const isDateCompleted = (date: Date) => {
    return completedDates.some(completedDate =>
      isSameDay(parseISO(completedDate), date)
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.navButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={styles.navButton}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {daysInMonth.map((day, index) => (
          <View
            key={day.toString()}
            style={[
              styles.dayCell,
              !isSameMonth(day, currentMonth) && styles.otherMonthDay,
            ]}
          >
            <Text
              style={[
                styles.dayNumber,
                isDateCompleted(day) && styles.completedDay,
              ]}
            >
              {format(day, 'd')}
            </Text>
          </View>
        ))}
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
    marginVertical: 10,
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
    color: '#333',
  },
  navButton: {
    fontSize: 20,
    color: '#6200ee',
    paddingHorizontal: 10,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDay: {
    fontSize: 12,
    color: '#666',
    width: '14.28%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherMonthDay: {
    opacity: 0.4,
  },
  dayNumber: {
    fontSize: 14,
    color: '#333',
  },
  completedDay: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  streakInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default StreakCalendar;
