import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface StreakDay {
  date: string;
  isGraceDay?: boolean;
}

interface StreakCalendarProps {
  streakData: StreakDay[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ streakData }) => {
  // Get the current month and create an array of all days in the month
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create a map of streak dates for quick lookup
  const streakMap = new Map<string, boolean>();
  streakData.forEach(day => {
    streakMap.set(day.date, day.isGraceDay || false);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.monthHeader}>{format(today, 'MMMM yyyy')}</Text>
      <View style={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>
      <View style={styles.calendar}>
        {daysInMonth.map((day, index) => {
          const dayString = format(day, 'yyyy-MM-dd');
          const isStreakDay = streakMap.has(dayString);
          const isGraceDay = streakMap.get(dayString);

          return (
            <View key={index} style={styles.dayContainer}>
              <Text style={[
                styles.dayNumber,
                isSameDay(day, today) ? styles.today : null
              ]}>
                {format(day, 'd')}
              </Text>
              {isStreakDay && (
                <View style={[
                  styles.dot,
                  { backgroundColor: isGraceDay ? '#FFD700' : '#4CAF50' }
                ]} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 20,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekday: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNumber: {
    fontSize: 16,
    marginBottom: 4,
  },
  today: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default StreakCalendar;
