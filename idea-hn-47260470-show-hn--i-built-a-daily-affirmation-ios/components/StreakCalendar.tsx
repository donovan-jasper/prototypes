import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameWeek, isSameMonth, addMonths, subMonths } from 'date-fns';
import { MILESTONE_DAYS, STREAK_COLORS } from '../lib/constants';
import { getGraceDaysUsedThisWeek } from '../lib/affirmations';

interface StreakDay {
  date: string;
  isGraceDay?: boolean;
}

interface StreakCalendarProps {
  streakData: StreakDay[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ streakData }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [graceDaysUsed, setGraceDaysUsed] = React.useState(0);

  React.useEffect(() => {
    const fetchGraceDays = async () => {
      const used = await getGraceDaysUsedThisWeek(currentMonth);
      setGraceDaysUsed(used);
    };
    fetchGraceDays();
  }, [currentMonth]);

  // Get the current month and create an array of all days in the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create a map of streak dates for quick lookup
  const streakMap = new Map<string, boolean>();
  streakData.forEach(day => {
    streakMap.set(day.date, day.isGraceDay || false);
  });

  // Get all milestone dates in the current month
  const milestoneDates = MILESTONE_DAYS.map(days => {
    const milestoneDate = new Date();
    milestoneDate.setDate(currentMonth.getDate() - days);
    return format(milestoneDate, 'yyyy-MM-dd');
  });

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.navButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthHeader}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={styles.navButton}>→</Text>
        </TouchableOpacity>
      </View>

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
          const isToday = isSameDay(day, new Date());

          return (
            <View key={index} style={styles.dayContainer}>
              <Text style={[
                styles.dayNumber,
                isToday ? styles.today : null,
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

      <View style={styles.graceDayInfo}>
        <Text style={styles.graceDayText}>Grace Days Used This Week: {graceDaysUsed}/2</Text>
        <Text style={styles.graceDaySubtext}>You can use up to 2 grace days per week</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
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
    marginBottom: 15,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  navButton: {
    fontSize: 20,
    paddingHorizontal: 10,
    color: '#4CAF50',
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
    color: '#333',
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
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  milestoneBadge: {
    fontSize: 12,
    position: 'absolute',
    top: -5,
    right: -5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  graceDayInfo: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  graceDayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  graceDaySubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default StreakCalendar;
