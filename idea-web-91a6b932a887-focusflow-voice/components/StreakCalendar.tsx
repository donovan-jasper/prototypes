import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay } from 'date-fns';
import { getStreak } from '../lib/database';

interface StreakCalendarProps {
  month?: Date;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ month = new Date() }) => {
  const [completedDates, setCompletedDates] = useState<Date[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    const loadStreakData = async () => {
      const streak = await getStreak();
      setCurrentStreak(streak);

      // In a real app, you would fetch actual completed dates from the database
      // For this example, we'll simulate some data
      const today = new Date();
      const dates = [];
      for (let i = 0; i < streak; i++) {
        dates.push(new Date(today.getTime() - i * 24 * 60 * 60 * 1000));
      }
      setCompletedDates(dates);
    };

    loadStreakData();
  }, []);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const isDateCompleted = (date: Date) => {
    return completedDates.some(completedDate =>
      isSameDay(completedDate, date)
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>{format(month, 'MMMM yyyy')}</Text>

      <View style={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>

      <View style={styles.days}>
        {days.map((day, index) => (
          <View
            key={index}
            style={[
              styles.day,
              !isSameMonth(day, month) && styles.otherMonthDay,
              isDateCompleted(day) && styles.completedDay,
            ]}
          >
            <Text style={[
              styles.dayText,
              isDateCompleted(day) && styles.completedDayText,
            ]}>
              {format(day, 'd')}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.completedLegendDot]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.missedLegendDot]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
      </View>

      <Text style={styles.streakInfo}>Current Streak: {currentStreak} days</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekday: {
    fontSize: 12,
    color: '#666',
    width: '14%',
    textAlign: 'center',
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  day: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  completedDay: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  completedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  completedLegendDot: {
    backgroundColor: '#4CAF50',
  },
  missedLegendDot: {
    backgroundColor: '#e0e0e0',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  streakInfo: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default StreakCalendar;
