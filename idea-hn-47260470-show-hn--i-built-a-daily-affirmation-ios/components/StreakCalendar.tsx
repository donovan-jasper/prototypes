import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';

interface StreakDay {
  date: string;
  isGraceDay?: boolean;
}

interface StreakCalendarProps {
  streakData: StreakDay[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ streakData }) => {
  // Group streak data by month
  const groupedByMonth: Record<string, StreakDay[]> = {};

  streakData.forEach(day => {
    const date = parseISO(day.date);
    const monthKey = format(date, 'MMMM yyyy');

    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = [];
    }

    groupedByMonth[monthKey].push(day);
  });

  return (
    <View style={styles.container}>
      {Object.entries(groupedByMonth).map(([month, days]) => (
        <View key={month} style={styles.monthContainer}>
          <Text style={styles.monthHeader}>{month}</Text>
          <View style={styles.calendar}>
            {days.map((day, index) => {
              const date = parseISO(day.date);
              return (
                <View key={index} style={styles.day}>
                  <Text style={styles.dayNumber}>{format(date, 'd')}</Text>
                  <View style={[
                    styles.dot,
                    { backgroundColor: day.isGraceDay ? '#ffcc00' : '#00cc00' }
                  ]} />
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthContainer: {
    marginBottom: 30,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    alignItems: 'center',
    marginBottom: 15,
  },
  dayNumber: {
    fontSize: 14,
    marginBottom: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default StreakCalendar;
