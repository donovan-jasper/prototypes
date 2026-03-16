import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth } from 'date-fns';
import { useStore } from '../store/useStore';

const StreakCalendar: React.FC = () => {
  const { userStats } = useStore();
  const today = new Date();
  const startDate = startOfWeek(today);
  const endDate = endOfWeek(today);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const isCompletedDay = (date: Date) => {
    return userStats.completedDays.some((completedDate) =>
      isSameDay(new Date(completedDate), date)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {days.map((day) => (
          <Text key={day.toString()} style={styles.dayHeader}>
            {format(day, 'EEE')}
          </Text>
        ))}
      </View>
      <View style={styles.daysContainer}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.toString()}
            style={[
              styles.day,
              isCompletedDay(day) && styles.completedDay,
              !isSameMonth(day, today) && styles.otherMonth,
            ]}
          >
            <Text style={styles.dayText}>{format(day, 'd')}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayHeader: {
    width: '14%',
    textAlign: 'center',
    fontSize: 12,
    color: '#636e72',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  completedDay: {
    backgroundColor: '#6c5ce7',
    borderRadius: 5,
  },
  otherMonth: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 14,
    color: '#2d3436',
  },
});

export default StreakCalendar;
