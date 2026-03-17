import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameWeek, isSameMonth } from 'date-fns';
import { MILESTONE_DAYS, STREAK_COLORS } from '../lib/constants';

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

  // Get all milestone dates in the current month
  const milestoneDates = MILESTONE_DAYS.map(days => {
    const milestoneDate = new Date();
    milestoneDate.setDate(today.getDate() - days);
    return format(milestoneDate, 'yyyy-MM-dd');
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
          const isMilestone = milestoneDates.includes(dayString);

          return (
            <View key={index} style={styles.dayContainer}>
              <Text style={[
                styles.dayNumber,
                isSameDay(day, today) ? styles.today : null,
                isMilestone ? styles.milestone : null
              ]}>
                {format(day, 'd')}
              </Text>
              {isStreakDay && (
                <View style={[
                  styles.dot,
                  { backgroundColor: isGraceDay ? STREAK_COLORS.grace : STREAK_COLORS.regular }
                ]} />
              )}
              {isMilestone && (
                <Text style={styles.milestoneBadge}>🎉</Text>
              )}
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STREAK_COLORS.regular }]} />
          <Text style={styles.legendText}>Regular Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STREAK_COLORS.grace }]} />
          <Text style={styles.legendText}>Grace Day</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendText}>🎉 Milestone</Text>
        </View>
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
    position: 'relative',
  },
  dayNumber: {
    fontSize: 16,
    marginBottom: 4,
  },
  today: {
    color: STREAK_COLORS.today,
    fontWeight: 'bold',
  },
  milestone: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  milestoneBadge: {
    position: 'absolute',
    top: -5,
    right: 5,
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default StreakCalendar;
