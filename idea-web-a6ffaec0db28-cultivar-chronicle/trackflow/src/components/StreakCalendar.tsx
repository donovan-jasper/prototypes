import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Entry } from '../types';

interface StreakCalendarProps {
  entries: Entry[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ entries }) => {
  const daysInMonth = 30; // Simplified for MVP
  const entryDates = entries.map((entry) => new Date(entry.timestamp).getDate());

  return (
    <View style={styles.container}>
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
        <View
          key={day}
          style={[
            styles.day,
            entryDates.includes(day) && styles.activeDay,
          ]}
        >
          <Text style={styles.dayText}>{day}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  day: {
    width: '14.28%', // 7 days in a week
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeDay: {
    backgroundColor: '#007AFF',
  },
  dayText: {
    fontSize: 12,
  },
});

export default StreakCalendar;
