import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakDay {
  date: string;
  isGraceDay?: boolean;
}

interface StreakCalendarProps {
  streakData: StreakDay[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ streakData }) => {
  return (
    <View style={styles.calendar}>
      {streakData.map((day, index) => (
        <View key={index} style={styles.day}>
          <Text>{day.date}</Text>
          <View style={[styles.dot, { backgroundColor: day.isGraceDay ? '#ffcc00' : '#00cc00' }]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default StreakCalendar;
