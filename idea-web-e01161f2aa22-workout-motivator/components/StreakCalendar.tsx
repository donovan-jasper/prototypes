import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getCompletedDates } from '../lib/database';

export default function StreakCalendar() {
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadCompletedDates();
  }, []);

  const loadCompletedDates = async () => {
    const dates = await getCompletedDates();
    setCompletedDates(dates);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const isDateCompleted = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return completedDates.has(dateStr);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const completed = isDateCompleted(day);
    const isToday = 
      day === new Date().getDate() &&
      currentMonth.getMonth() === new Date().getMonth() &&
      currentMonth.getFullYear() === new Date().getFullYear();

    days.push(
      <View
        key={day}
        style={[
          styles.dayCell,
          completed && styles.dayCellCompleted,
          isToday && styles.dayCellToday,
        ]}
      >
        <Text style={[
          styles.dayText,
          completed && styles.dayTextCompleted,
          isToday && styles.dayTextToday,
        ]}>
          {day}
        </Text>
        {completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>{monthName}</Text>
      <View style={styles.weekDays}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <Text key={i} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>
      <View style={styles.calendar}>
        {days}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  dayCellCompleted: {
    backgroundColor: '#4CAF50',
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dayTextCompleted: {
    color: '#fff',
    fontWeight: '600',
  },
  dayTextToday: {
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    fontSize: 10,
    color: '#fff',
    top: 2,
    right: 4,
  },
});
